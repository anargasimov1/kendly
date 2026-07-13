import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ContentPage = sequelize.define('ContentPage', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true // 'about-us', 'terms-of-service' kimi unikal linklər üçün
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
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
  tableName: 'content_pages',
  timestamps: false
});

export default ContentPage;
