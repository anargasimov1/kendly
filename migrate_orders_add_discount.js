import { sequelize } from './src/config/db.js';

const migrate = async () => {
  try {
    await sequelize.authenticate();
    
    // Create enum type if it doesn't exist
    const [results] = await sequelize.query(`
      SELECT 1 FROM pg_type WHERE typname = 'enum_orders_payment_method';
    `);
    
    if (results.length === 0) {
      await sequelize.query(`
        CREATE TYPE "enum_orders_payment_method" AS ENUM ('card', 'cash');
      `);
    }

    await sequelize.query(`
      ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS payment_method "enum_orders_payment_method" NOT NULL DEFAULT 'cash';
    `);
    console.log("Orders table updated successfully with discount and payment_method!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
