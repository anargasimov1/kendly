import { sequelize } from './src/config/db.js';

const migrate = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.query(`
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS image VARCHAR(255),
      ADD COLUMN IF NOT EXISTS stock INTEGER NOT NULL DEFAULT 0;
    `);
    console.log("Products table updated successfully with image and stock!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
