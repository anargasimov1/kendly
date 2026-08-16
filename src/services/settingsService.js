import { Settings, AuditLog } from '../models/index.js';

class SettingsService {
  // Tənzimləmələri gətir (həmişə id=1 olan tək sətir)
  async getSettings() {
    let settings = await Settings.findByPk(1);
    if (!settings) {
      // Əgər heç bir sətir yoxdursa, default dəyərlərlə yarat
      settings = await Settings.create({});
    }
    return settings;
  }

  // Tənzimləmələri yenilə
  async updateSettings(data, adminId) {
    let settings = await Settings.findByPk(1);
    if (!settings) {
      settings = await Settings.create({});
    }

    // Yalnız göndərilən sahələri yenilə
    const allowedFields = [
      'site_name', 'site_email', 'site_phone', 'site_address',
      'delivery_fee', 'free_delivery_min', 'max_delivery_days',
      'email_notifications', 'sms_notifications', 'maintenance_mode'
    ];

    const changes = {};
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        changes[field] = { old: settings[field], new: data[field] };
        settings[field] = data[field];
      }
    }

    await settings.save();

    // Audit log yaz
    if (adminId) {
      await AuditLog.create({
        adminId,
        action: 'settings.update',
        targetType: 'settings',
        targetId: '1',
        meta: changes,
      });
    }

    return settings;
  }
}

export default new SettingsService();
