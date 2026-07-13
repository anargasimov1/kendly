import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'order_id',
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'pending',
    allowNull: false,
  },
  provider: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'mock',
  },
  providerData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'provider_data',
  },
  idempotencyKey: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    field: 'idempotency_key',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  tableName: 'payments',
  timestamps: false,
});

export default Payment;
