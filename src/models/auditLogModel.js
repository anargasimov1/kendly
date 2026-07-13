import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  adminId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'admin_id',
  },
  action: {
    // Məsələn: 'user.suspend', 'user.activate', 'farmer.approve', 'farmer.reject'
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  targetType: {
    // Məsələn: 'user', 'order', 'payment'
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'target_type',
  },
  targetId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'target_id',
  },
  meta: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  tableName: 'audit_logs',
  timestamps: false,
});

export default AuditLog;
