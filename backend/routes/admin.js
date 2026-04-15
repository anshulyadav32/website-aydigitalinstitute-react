import express from 'express';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import User from '../models/User.js';
import Inquiry from '../models/Inquiry.js';
import Course from '../models/Course.js';
import Setting from '../models/Setting.js';
import { Op } from 'sequelize';

const router = express.Router();

// --- USER MANAGEMENT ---

router.get('/users', protect, admin, async (req, res) => {
  try {
    const { search, role } = req.query;
    let where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { username: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (role && role !== 'all') where.role = role;

    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    await user.update(req.body);
    res.json({ success: true, message: 'User updated', data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.id === req.user.id) return res.status(400).json({ success: false, message: 'Cannot delete self' });
    
    await user.destroy();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- COURSE MANAGEMENT ---

router.get('/courses', protect, admin, async (req, res) => {
  try {
    const courses = await Course.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/courses', protect, admin, async (req, res) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/courses/:id', protect, admin, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    
    await course.update(req.body);
    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/courses/:id', protect, admin, async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    
    await course.destroy();
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- INQUIRY MANAGEMENT ---

router.get('/inquiries', protect, admin, async (req, res) => {
  try {
    const inquiries = await Inquiry.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ success: true, data: inquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/inquiries/:id', protect, admin, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    
    inquiry.status = req.body.status;
    await inquiry.save();
    res.json({ success: true, data: inquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.delete('/inquiries/:id', protect, admin, async (req, res) => {
  try {
    const inquiry = await Inquiry.findByPk(req.params.id);
    if (!inquiry) return res.status(404).json({ success: false, message: 'Inquiry not found' });
    
    await inquiry.destroy();
    res.json({ success: true, message: 'Inquiry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- SETTINGS MANAGEMENT ---

router.get('/settings', protect, admin, async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const settingsMap = {};
    settings.forEach(s => settingsMap[s.key] = s.value);
    res.json({ success: true, data: settingsMap });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/settings', protect, admin, async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await Setting.upsert({ key, value });
    }
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// --- STATS ---

router.get('/stats', protect, admin, async (req, res) => {
  try {
    const [userCount, adminCount, courseCount, inquiryCount] = await Promise.all([
      User.count({ where: { role: 'student' } }),
      User.count({ where: { role: 'admin' } }),
      Course.count(),
      Inquiry.count({ where: { status: 'new' } })
    ]);

    res.json({
      success: true,
      data: {
        totalStudents: userCount,
        totalAdmins: adminCount,
        totalCourses: courseCount,
        newInquiries: inquiryCount,
        totalUsers: userCount + adminCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
