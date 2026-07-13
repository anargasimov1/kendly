import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const FarmerProfile = sequelize.define('FarmerProfile', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verification_status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending', // pending, approved, rejected
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'farmer_profiles',
  timestamps: false
});

export default FarmerProfile;
