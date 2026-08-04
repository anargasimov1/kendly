import { sequelize } from './src/config/db.js';

const runMigration = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Use QueryInterface to add columns
    const queryInterface = sequelize.getQueryInterface();

    console.log('Adding farm_name...');
    await queryInterface.addColumn('farmer_profiles', 'farm_name', {
      type: sequelize.Sequelize.DataTypes.STRING(255),
      allowNull: true
    }).catch(e => console.log('Already exists or error: ', e.message));

    console.log('Adding farm_address...');
    await queryInterface.addColumn('farmer_profiles', 'farm_address', {
      type: sequelize.Sequelize.DataTypes.STRING(255),
      allowNull: true
    }).catch(e => console.log('Already exists or error: ', e.message));

    console.log('Adding farm_phone...');
    await queryInterface.addColumn('farmer_profiles', 'farm_phone', {
      type: sequelize.Sequelize.DataTypes.STRING(20),
      allowNull: true
    }).catch(e => console.log('Already exists or error: ', e.message));

    console.log('Adding experience_years...');
    await queryInterface.addColumn('farmer_profiles', 'experience_years', {
      type: sequelize.Sequelize.DataTypes.INTEGER,
      allowNull: true
    }).catch(e => console.log('Already exists or error: ', e.message));

    console.log('Adding id_card_number...');
    await queryInterface.addColumn('farmer_profiles', 'id_card_number', {
      type: sequelize.Sequelize.DataTypes.STRING(20),
      allowNull: true
    }).catch(e => console.log('Already exists or error: ', e.message));

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
