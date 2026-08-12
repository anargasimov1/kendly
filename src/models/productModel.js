import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  product_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  is_best_seller: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_seasonal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  is_natural: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  region_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: true, // Daha öncədən var olan məhsullar xəta verməsin deyə true kimi saxlayırıq
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at' // Bazadakı sütun adı ilə eyniləşdirmək üçün
  }
}, {
  tableName: 'products',
  timestamps: false // Manual idarə etdiyimiz üçün
});

export default Product;
