import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false
  },
  level: {
    type: DataTypes.STRING,
    allowNull: false
  },
  topics: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  icon: {
    type: DataTypes.STRING,
    defaultValue: 'FaLaptop'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'courses',
  timestamps: true
});

export default Course;
