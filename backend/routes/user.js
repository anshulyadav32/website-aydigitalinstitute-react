import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import { upload, supabase } from '../utils/fileUpload.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   POST /api/user/profile-pic
// @desc    Upload user profile picture
// @access  Private
router.post('/profile-pic', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete old profile pic if exists
    if (user.profilePic) {
      try {
        // Extract the filename from the URL to delete it from Storage
        // Supabase URL format: .../storage/v1/object/public/aydigital/profile-pics/filename
        const urlParts = user.profilePic.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        await supabase.storage
          .from('aydigital')
          .remove([`profile-pics/${fileName}`]);
      } catch (err) {
        console.error('Error deleting old profile pic from Supabase:', err);
      }
    }

    // Upload to Supabase Storage
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = `user-${req.user.id}-${uniqueSuffix}${path.extname(req.file.originalname)}`;
    const filePath = `profile-pics/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('aydigital')
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('aydigital')
      .getPublicUrl(filePath);
      
    user.profilePic = publicUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Profile picture updated',
      data: {
        profilePic: publicUrl,
      }
    });
  } catch (error) {
    console.error('Profile pic upload error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/profile', 
  [
    protect,
    body('username').optional().isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please include a valid email'),
    body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    body('dob').optional().isDate().withMessage('Invalid date of birth'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { name, email, phone, courseInterested, username, gender, dob } = req.body;
      
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check username availability if it's being changed
      if (username && username !== user.username) {
        const usernameExists = await User.findOne({ where: { username } });
        if (usernameExists) {
          return res.status(400).json({
            success: false,
            message: 'Username is already taken',
          });
        }
        user.username = username;
      }

      // Check email availability if it's being changed
      if (email && email !== user.email) {
        const emailExists = await User.findOne({ where: { email } });
        if (emailExists) {
          return res.status(400).json({
            success: false,
            message: 'Email is already in use by another account',
          });
        }
        user.email = email;
      }

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (courseInterested !== undefined) user.courseInterested = courseInterested;
      if (gender) user.gender = gender;
      if (dob) user.dob = dob;

      const updatedUser = await user.save();

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          username: updatedUser.username,
          phone: updatedUser.phone,
          courseInterested: updatedUser.courseInterested,
          role: updatedUser.role,
          profilePic: updatedUser.profilePic,
          gender: updatedUser.gender,
          dob: updatedUser.dob,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message,
      });
    }
});

// @route   PUT /api/user/change-password
// @desc    Change user password
// @access  Private
router.put(
  '/change-password',
  [
    protect,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await user.matchPassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Incorrect current password' });
      }

      user.password = newPassword;
      await user.save();

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

export default router;
