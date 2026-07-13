import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Messages = sequelize.define('Messages', {

    message: {
        type: DataTypes.TEXT
    },
    phone: {
        type: DataTypes.INTEGER
    },
    email: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'messages',
    timestamps: false
});

export default Messages;
