import { Settings } from '../models/index.js';

const isExemptPath = (path) => (
  path === '/health'
  || path === '/readiness'
  || path.startsWith('/api/auth')
  || path === '/api/settings'
  || path === '/api/settings/maintenance'
  || path.startsWith('/api-docs')
);

export const maintenanceMiddleware = async (req, res, next) => {
  if (isExemptPath(req.path)) {
    return next();
  }

  try {
    const settings = await Settings.findByPk(1, { attributes: ['maintenance_mode'] });
    if (settings?.maintenance_mode) {
      return res.status(503).json({
        error: 'Sistem texniki xidmət rejimindədir',
        maintenance_mode: true,
      });
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
