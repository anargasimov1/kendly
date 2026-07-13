import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const NewsletterSubscriber = sequelize.define('NewsletterSubscriber', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  whatsapp: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  telegram: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  subscribed_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  unsubscribed_at: {
    type: DataTypes.DATE,
    allowNull: true,
  }
}, {
  tableName: 'newsletter_subscribers',
  timestamps: false
});

export default NewsletterSubscriber;
