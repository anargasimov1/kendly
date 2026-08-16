import { sequelize } from './src/config/db.js';

const migrate = async () => {
  try {
    await sequelize.authenticate();

    await sequelize.query(`
      ALTER TABLE reviews
        ALTER COLUMN product_id DROP NOT NULL;

      ALTER TABLE reviews
        ADD COLUMN IF NOT EXISTS combo_id INTEGER REFERENCES combo_menus(id) ON DELETE CASCADE;

      ALTER TABLE order_items
        ADD COLUMN IF NOT EXISTS combo_id INTEGER REFERENCES combo_menus(id) ON DELETE SET NULL;
    `);

    console.log('Combo reviews migration completed!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
