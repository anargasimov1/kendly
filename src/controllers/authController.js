import authService from '../services/authService.js';

export const registerAdmin = async (req, res, next) => {
  try {
    const user = await authService.registerAdmin(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    if (error.message === 'Yanlış şifrə' || error.message === 'İstifadəçi tapılmadı') {
      error.statusCode = 401;
    } else if (error.message.includes('kilidlənib') || error.message.includes('dayandırılıb')) {
      error.statusCode = 403;
    }
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    res.json(result);
  } catch (error) {
    error.statusCode = 401;
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await authService.logout(userId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const token = req.body?.token ?? req.body?.idToken ?? req.body?.credential ?? req.body?.googleToken;
    const result = await authService.googleLogin(token);
    res.json(result);
  } catch (error) {
    if (error.message.includes('Etibarsız') || error.message.includes('tələb olunur') || error.message.includes('email əldə edilə bilmədi')) {
      error.statusCode = 401;
    } else if (error.message.includes('dayandırılıb')) {
      error.statusCode = 403;
    }
    next(error);
  }
};

export const facebookLogin = async (req, res, next) => {
  try {
    const { token } = req.body;
    const result = await authService.facebookLogin(token);
    res.json(result);
  } catch (error) {
    if (error.message.includes('Etibarsız') || error.message.includes('tələb olunur')) {
      error.statusCode = 401;
    } else if (error.message.includes('dayandırılıb')) {
      error.statusCode = 403;
    }
    next(error);
  }
};
