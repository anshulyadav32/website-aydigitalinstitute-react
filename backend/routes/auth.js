import express from 'express';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User.js';
import Inquiry from '../models/Inquiry.js';
import { generateToken } from '../utils/generateToken.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please include a valid email'),
    body('username').optional().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { name, email, password, phone, courseInterested, username } = req.body;

      // Check if email already exists
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      // Check if username already exists
      if (username) {
        const usernameExists = await User.findOne({ where: { username } });
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Username is already taken',
          });
        }
      }

      // Create user
      const user = await User.create({
        name,
        email,
        username,
        password,
        phone,
        courseInterested,
        role: email === 'admin@aydigital.com' ? 'admin' : 'student',
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          role: user.role,
          token: generateToken(user.id),
        },
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Authenticate a user & get token (supports email or username)
// @access  Public
router.post(
  '/login',
  [
    body('login').notEmpty().withMessage('Please provide email or username'),
    body('password').exists().withMessage('Password is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { login, password } = req.body;

      // Check for user email OR username
      const user = await User.findOne({ 
        where: { 
          [Op.or]: [
            { email: login },
            { username: login }
          ]
        } 
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated',
        });
      }

      // Check password
      const isMatch = await user.matchPassword(password);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          phone: user.phone,
          role: user.role,
          courseInterested: user.courseInterested,
          token: generateToken(user.id),
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
  }
);

// @route   GET /api/auth/check-username/:username
// @desc    Check if username is available
// @access  Public
router.get('/check-username/:username', async (req, res) => {
  try {
    const user = await User.findOne({ where: { username: req.params.username } });
    if (user) {
      return res.json({ available: false, message: 'Username is already taken' });
    }
    res.json({ available: true, message: 'Username is available' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/auth/inquiry
// @desc    Submit a contact inquiry
// @access  Public
router.post('/inquiry', async (req, res) => {
  try {
    const { name, phone, course, message } = req.body;
    const inquiry = await Inquiry.create({ name, phone, course, message });
    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
