import { sequelize } from './src/config/db.js';

const migrate = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ NULL;
    `);
    console.log('orders.delivered_at column added successfully.');
    await sequelize.close();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
};

migrate();
