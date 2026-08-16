import { sequelize } from './src/config/db.js';
import './src/models/index.js';

const migrate = async () => {
  try {
    await sequelize.authenticate();
    console.log('Verilənlər bazasına qoşuldu, əksik cədvəllər yaradılır...');
    
    // 1. Yeni əlavə edilmiş "Category", "Region", "AuditLog" kimi cədvəllər varsa yaradılır.
    // alter: false olduğu üçün mövcud cədvəllərə toxunmur, enum xətası vermir.
    await sequelize.sync();
    console.log('Əksik cədvəllər uğurla yaradıldı.');

    // 2. Mövcud cədvəllərdə son sütun dəyişiklikləri
    console.log('Sütun dəyişiklikləri icra olunur...');
    await sequelize.query(`
      ALTER TABLE products
        ADD COLUMN IF NOT EXISTS sales_count INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS is_weekly_choice BOOLEAN NOT NULL DEFAULT false;

      ALTER TABLE blogs
        ADD COLUMN IF NOT EXISTS views INTEGER NOT NULL DEFAULT 0;

      ALTER TABLE blogs
        ALTER COLUMN image TYPE TEXT;

      ALTER TABLE combo_menus
        ALTER COLUMN image TYPE TEXT;
        
      ALTER TABLE farmer_profiles
        ALTER COLUMN profile_image TYPE TEXT;
    `);

    console.log('Bütün yeni dəyişikliklər uğurla bazaya bağlandı!');
    process.exit(0);
  } catch (err) {
    console.error('Miqrasiya zamanı xəta baş verdi:', err);
    process.exit(1);
  }
};

migrate();
