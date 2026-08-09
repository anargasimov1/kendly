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
  profile_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  farmName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'farm_name'
  },
  farmAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'farm_address'
  },
  farmPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'farm_phone'
  },
  experienceYears: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'experience_years'
  },
  idCardNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'id_card_number'
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
