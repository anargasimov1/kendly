import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  // === Sayt Məlumatları ===
  site_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'Kendly',
  },
  site_email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    defaultValue: 'info@kendly.az',
  },
  site_phone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: '+994 12 555 0000',
  },
  site_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Bakı, Azərbaycan',
  },
  // === Çatdırılma Parametrləri ===
  delivery_fee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 5.00,
  },
  free_delivery_min: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 30.00,
  },
  max_delivery_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3,
  },
  // === Təhlükəsizlik və Bildirişlər ===
  email_notifications: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  sms_notifications: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  maintenance_mode: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  // === Tarixlər ===
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at',
  },
}, {
  tableName: 'settings',
  timestamps: true,
});

export default Settings;
