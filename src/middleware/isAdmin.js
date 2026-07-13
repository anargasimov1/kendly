export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Giriş qadağandır! Yalnız adminlər üçün (Forbidden)' });
  }
  next();
};
