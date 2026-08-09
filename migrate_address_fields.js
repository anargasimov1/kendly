import { sequelize } from './src/config/db.js';

const migrate = async () => {
  try {
    await sequelize.authenticate();
    
    // Add contact_name
    await sequelize.query(`
      ALTER TABLE addresses
      ADD COLUMN IF NOT EXISTS contact_name VARCHAR(255);
    `);

    // Add contact_phone
    await sequelize.query(`
      ALTER TABLE addresses
      ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50);
    `);

    // Make title optional
    await sequelize.query(`
      ALTER TABLE addresses
      ALTER COLUMN title DROP NOT NULL;
    `);
    
    console.log("Addresses table updated successfully with contact fields!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
