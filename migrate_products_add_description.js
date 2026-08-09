import { sequelize } from './src/config/db.js';

const migrate = async () => {
  try {
    await sequelize.authenticate();
    
    await sequelize.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS description TEXT;
    `);
    
    console.log("Products table updated successfully with description!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
