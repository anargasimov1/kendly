import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { UserDto } from '../dto/userDto.js';

class AuthService {
  async registerAdmin(data) {
    const { name, email, password } = data;
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      name, 
      email, 
      password: hashPassword,
      role: 'admin' 
    });
    return {...new UserDto(user)};
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

    // Uğurlu giriş - sıfırlama
    user.failedAttempts = 0;
    user.lockedUntil = null;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'antigravity_refresh_secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'}
    );

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: new UserDto(user),
      token,
      refreshToken
    };
  }

  async refresh(refreshToken) {
      if (!refreshToken) throw new Error("Refresh token tələb olunur");
      
      const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'antigravity_refresh_secret');
      const user = await User.findByPk(payload.id);

      if (!user || user.refreshToken !== refreshToken) {
          throw new Error("Yanlış refresh token");
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
      );

      return { token };
  }

  async logout(userId) {
      await User.update({ refreshToken: null }, { where: { id: userId } });
      return { message: "Uğurla çıxış edildi" };
  }
}

export default new AuthService();
