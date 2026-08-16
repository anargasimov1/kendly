import settingsService from '../services/settingsService.js';

export const getSettings = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const adminId = req.user ? req.user.id : null;
    const settings = await settingsService.updateSettings(req.body, adminId);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceStatus = async (req, res, next) => {
  try {
    const settings = await settingsService.getSettings();
    res.json({ maintenance_mode: settings.maintenance_mode });
  } catch (error) {
    next(error);
  }
};

export const toggleMaintenanceStatus = async (req, res, next) => {
  try {
    const adminId = req.user ? req.user.id : null;
    const { maintenance_mode } = req.body;
    if (typeof maintenance_mode !== 'boolean') {
      return res.status(400).json({ error: 'maintenance_mode boolean (true/false) olmalıdır' });
    }
    const settings = await settingsService.updateSettings({ maintenance_mode }, adminId);
    res.json({ message: "Texniki xidmət rejimi yeniləndi", maintenance_mode: settings.maintenance_mode });
  } catch (error) {
    next(error);
  }
};
