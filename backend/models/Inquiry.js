import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Inquiry = sequelize.define('Inquiry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  course: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('new', 'contacted', 'resolved'),
    defaultValue: 'new'
  }
}, {
  tableName: 'inquiries',
  timestamps: true
});

export default Inquiry;
