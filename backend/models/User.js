import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import bcrypt from 'bcryptjs';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: 'Please add a name',
        },
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        len: {
          args: [3, 30],
          msg: 'Username must be between 3 and 30 characters',
        },
        is: {
          args: /^[a-zA-Z0-9_]+$/i,
          msg: 'Username can only contain letters, numbers, and underscores',
        },
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: {
          msg: 'Please add a valid email',
        },
        notEmpty: {
          msg: 'Please add an email',
        },
      },
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: {
          args: [6, 255],
          msg: 'Password must be at least 6 characters',
        },
        notEmpty: {
          msg: 'Please add a password',
        },
      },
    },
    role: {
      type: DataTypes.ENUM('student', 'admin'),
      defaultValue: 'student',
    },
    courseInterested: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    profilePic: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

// Instance method to match password
User.prototype.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default User;
