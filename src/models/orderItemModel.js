import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    field: 'order_id'
  },
  productId: {
    type: DataTypes.INTEGER,
    field: 'product_id',
    allowNull: true,
  },
  comboId: {
    type: DataTypes.INTEGER,
    field: 'combo_id',
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  }
}, {
  tableName: 'order_items',
  timestamps: false
});

export default OrderItem;
