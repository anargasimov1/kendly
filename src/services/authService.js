import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/index.js';
import { UserDto } from '../dto/userDto.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kendly_super_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'kendly_super_refresh_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '365d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '365d';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const buildTokenResponse = (user, token, refreshToken) => ({
  user: new UserDto(user),
  token,
  accessToken: token,
  refreshToken,
  expiresIn: JWT_EXPIRES_IN,
});

const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

const signRefreshToken = (user) =>
  jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN });

class AuthService {
  async registerAdmin(data) {
    const { name, email, password } = data;
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashPassword,
      role: 'admin',
    });
    return { ...new UserDto(user) };
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('İstifadəçi tapılmadı');
    }

    if (user.status === 'suspended') {
      throw new Error('Hesabınız dayandırılıb');
    }

    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Çox sayda yanlış cəhd. Hesabınız müvəqqəti kilidlənib.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= (process.env.LOGIN_LOCK_ATTEMPTS || 5)) {
        const lockMinutes = process.env.LOGIN_LOCK_DURATION_MINUTES || 15;
        user.lockedUntil = new Date(Date.now() + lockMinutes * 60000);
      }
      await user.save();
      throw new Error('Yanlış şifrə');
    }

    user.failedAttempts = 0;
    user.lockedUntil = null;

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return buildTokenResponse(user, token, refreshToken);
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      const error = new Error('Refresh token tələb olunur');
      error.statusCode = 401;
      throw error;
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    } catch (err) {
      const error = new Error(
        err.name === 'TokenExpiredError'
          ? 'Refresh tokenin vaxtı keçib. Yenidən daxil olun'
          : 'Yanlış refresh token'
      );
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findByPk(payload.id);

    if (!user || user.refreshToken !== refreshToken) {
      const error = new Error('Yanlış və ya etibarsız refresh token');
      error.statusCode = 401;
      throw error;
    }

    if (user.status === 'suspended') {
      const error = new Error('Hesabınız dayandırılıb');
      error.statusCode = 403;
      throw error;
    }

    const token = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      token,
      accessToken: token,
      refreshToken: newRefreshToken,
      expiresIn: JWT_EXPIRES_IN,
    };
  }

  async logout(userId) {
    await User.update({ refreshToken: null }, { where: { id: userId } });
    return { message: 'Uğurla çıxış edildi' };
  }

  async googleLogin(idToken) {
    const googleToken = typeof idToken === 'string'
      ? idToken
      : idToken?.token || idToken?.idToken || idToken?.credential || idToken?.googleToken;

    if (!googleToken) {
      const error = new Error('Google ID token tələb olunur');
      error.statusCode = 400;
      throw error;
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      const error = new Error('Etibarsız Google token');
      error.statusCode = 401;
      throw error;
    }

    if (!payload?.email) {
      const error = new Error('Google hesabından email əldə edilə bilmədi');
      error.statusCode = 401;
      throw error;
    }

    const { email, name, given_name, family_name } = payload;
    const safeName = name || [given_name, family_name].filter(Boolean).join(' ') || 'Google İstifadəçisi';

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name: safeName,
        email,
        role: 'user',
        status: 'active',
      });
    } else if (user.status === 'suspended') {
      const error = new Error('Hesabınız dayandırılıb');
      error.statusCode = 403;
      throw error;
    }

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return buildTokenResponse(user, token, refreshToken);
  }

  async facebookLogin(accessToken) {
    if (!accessToken) {
      const error = new Error('Facebook access token tələb olunur');
      error.statusCode = 400;
      throw error;
    }

    let fbUser;
    try {
      const response = await fetch(`https://graph.facebook.com/me?fields=id,name,email&access_token=${accessToken}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }
      fbUser = data;
    } catch (err) {
      const error = new Error('Etibarsız Facebook token');
      error.statusCode = 401;
      throw error;
    }

    const email = fbUser.email || `${fbUser.id}@facebook.com`;
    const name = fbUser.name || 'Facebook İstifadəçisi';

    let user = await User.findOne({ where: { email } });

    if (!user) {
      user = await User.create({
        name,
        email,
        role: 'user',
        status: 'active',
      });
    } else if (user.status === 'suspended') {
      const error = new Error('Hesabınız dayandırılıb');
      error.statusCode = 403;
      throw error;
    }

    const token = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    return buildTokenResponse(user, token, refreshToken);
  }
}

export default new AuthService();
