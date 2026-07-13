import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 10,       // Maksimum açıq bağlantı sayı
    min: 2,        // Minimum saxlanılan bağlantı sayı
    acquire: 30000, // Bağlantı qurmaq üçün maksimum gözləmə vaxtı (ms)
    idle: 10000    // İstifadəsiz bağlantının bağlanma vaxtı (ms)
  },
  logging: false,
});

// Database bağlantısını test et
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL bazasına uğurla qoşuldu!');
  } catch (error) {
    console.error('❌ Bazaya qoşulma xətası:', error.message);
    process.exit(1);
  }
};

export { sequelize, connectDB }
