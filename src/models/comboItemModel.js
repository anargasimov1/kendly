import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ComboItem = sequelize.define('ComboItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  combo_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'combo_items',
  timestamps: false
});

export default ComboItem;
