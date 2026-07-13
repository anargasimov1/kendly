import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Region = sequelize.define('Region', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'regions',
  timestamps: false
});

export default Region;
