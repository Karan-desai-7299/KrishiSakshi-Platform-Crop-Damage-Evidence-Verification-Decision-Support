import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import DamageReport from '../models/DamageReport.js';
import { maskPhone } from '../middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'krishisakshi_secure_jwt_dev_secret_key_2026';

export const authController = {
  /**
   * POST /api/demo/login
   * Issues JWT for seeded demo user (FARMER | OFFICER)
   */
  async demoLogin(req, res) {
    try {
      const { role } = req.body;
      const targetRole = role ? String(role).toUpperCase() : 'FARMER';

      if (!['FARMER', 'OFFICER'].includes(targetRole)) {
        return res.status(400).json({
          success: false,
          data: null,
          error: { message: 'Invalid role. Role must be FARMER or OFFICER.' }
        });
      }

      let user;
      if (targetRole === 'FARMER') {
        user = await User.findOne({ role: 'FARMER', name: 'Ram Patil' }) ||
               await User.findOne({ role: 'FARMER' });
        
        if (!user) {
          // Fallback if not seeded yet
          user = await User.create({
            name: 'Ram Patil',
            phone: '9999912345',
            role: 'FARMER',
            district: 'Kolhapur',
            taluka: 'Karveer',
            village: 'Shiroli',
            language: 'mr',
            isDemo: true
          });
        }
      } else {
        user = await User.findOne({ role: 'OFFICER' });
        if (!user) {
          user = await User.create({
            name: 'Sanjay Deshmukh',
            phone: '9999954321',
            role: 'OFFICER',
            district: 'Kolhapur',
            taluka: 'District HQ',
            village: 'District Center',
            language: 'en',
            isDemo: true
          });
        }
      }

      const token = jwt.sign(
        {
          id: user._id,
          role: user.role,
          name: user.name,
          phone: user.phone,
          village: user.village,
          district: user.district
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            role: user.role,
            phone: maskPhone(user.phone),
            village: user.village,
            district: user.district,
            language: user.language,
            isDemo: user.isDemo
          },
          notice: 'Demo environment — no real credentials needed.'
        },
        error: null
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        data: null,
        error: { message: err.message }
      });
    }
  },

  /**
   * GET /api/demo/me
   */
  async getMe(req, res) {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          data: null,
          error: { message: 'User record not found.' }
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: user._id,
          name: user.name,
          role: user.role,
          phone: maskPhone(user.phone),
          village: user.village,
          district: user.district,
          language: user.language,
          isDemo: user.isDemo
        },
        error: null
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        data: null,
        error: { message: err.message }
      });
    }
  },

  /**
   * GET /api/farmer/reports
   * Enforces report ownership: a farmer can only access their own reports
   */
  async getFarmerReports(req, res) {
    try {
      // If user is a farmer, strictly query by their own farmerId
      const filter = req.user.role === 'OFFICER' 
        ? {} 
        : { farmerId: req.user.id };

      const reports = await DamageReport.find(filter)
        .sort({ createdAt: -1 })
        .populate('farmerId', 'name village district');

      // Mask phone numbers in response
      const sanitized = reports.map(r => ({
        ...r.toObject(),
        farmerPhone: maskPhone(req.user.phone)
      }));

      res.status(200).json({
        success: true,
        data: sanitized,
        error: null
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        data: null,
        error: { message: err.message }
      });
    }
  }
};
