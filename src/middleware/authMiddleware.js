import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tapılmadı (Unauthorized)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kendly_super_secret_key');
    req.user = decoded; // { id, role, ... }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Yanlış və ya vaxtı keçmiş token', details: error.message });
  }
};

// Aliasing authMiddleware to protect for cleaner naming
export const protect = authMiddleware;

// Role-based authorization middleware
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Giriş qadağandır! Bu əməliyyat yalnız aşağıdakı rollar üçündür: ${roles.join(', ')}` 
      });
    }
    next();
  };
};
