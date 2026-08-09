import { sequelize } from './src/config/db.js';

const migrate = async () => {
  try {
    await sequelize.authenticate();
    
    // Add profile_image
    await sequelize.query(`
      ALTER TABLE farmer_profiles
      ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255);
    `);
    
    console.log("farmer_profiles table updated successfully with profile_image!");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

migrate();
