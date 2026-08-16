import { sequelize } from './src/config/db.js';

async function migrateSettings() {
  try {
    await sequelize.authenticate();
    console.log('✅ Bazaya qoşuldu');

    // Settings cədvəlini yarat
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        site_name VARCHAR(100) NOT NULL DEFAULT 'Kendly',
        site_email VARCHAR(100) NOT NULL DEFAULT 'info@kendly.az',
        site_phone VARCHAR(50) DEFAULT '+994 12 555 0000',
        site_address VARCHAR(255) DEFAULT 'Bakı, Azərbaycan',
        delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 5.00,
        free_delivery_min DECIMAL(10,2) NOT NULL DEFAULT 30.00,
        max_delivery_days INTEGER NOT NULL DEFAULT 3,
        email_notifications BOOLEAN NOT NULL DEFAULT true,
        sms_notifications BOOLEAN NOT NULL DEFAULT false,
        maintenance_mode BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ settings cədvəli yaradıldı');

    // Əgər cədvəl boşdursa, default sətir əlavə et
    const [rows] = await sequelize.query('SELECT COUNT(*) as cnt FROM settings');
    if (Number(rows[0].cnt) === 0) {
      await sequelize.query(`
        INSERT INTO settings (site_name, site_email, site_phone, site_address, delivery_fee, free_delivery_min, max_delivery_days, email_notifications, sms_notifications, maintenance_mode)
        VALUES ('Kendly', 'info@kendly.az', '+994 12 555 0000', 'Bakı, Azərbaycan', 5.00, 30.00, 3, true, false, false);
      `);
      console.log('✅ Default tənzimləmələr əlavə edildi');
    } else {
      console.log('ℹ️  Settings artıq mövcuddur, skip edildi');
    }

    console.log('🎉 Migratsiya tamamlandı!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migratsiya xətası:', error.message);
    process.exit(1);
  }
}

migrateSettings();
