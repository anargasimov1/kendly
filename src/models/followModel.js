import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Follow = sequelize.define('Follow', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  follower_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  following_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'follows',
  timestamps: false
});

export default Follow;
