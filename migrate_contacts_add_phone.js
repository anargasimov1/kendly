import { sequelize } from './src/config/db.js';

const migrate = async () => {
  try {
    await sequelize.authenticate();
    
    await sequelize.query(`
      ALTER TABLE contact_messages
      ADD COLUMN IF NOT EXISTS phone VARCHAR(255);
    `);
    
    console.log("Contact messages table updated successfully with phone!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
