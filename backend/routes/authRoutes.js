import express from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';

import User from '../models/User.js';
import validate from '../middleware/validate.js';
import { generateToken } from '../utils/auth.js';

const router = express.Router();

router.post(
  '/signup',
  [
    body('username')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Username must be between 3 and 20 characters')
      .matches(/^[a-zA-Z0-9._]+$/)
      .withMessage('Username must be alphanumeric and may include . or _'),
    body('email').trim().isEmail().withMessage('A valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('bio').optional().isString().withMessage('Bio must be text'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { username, email, password, fullName, bio = '' } = req.body;

      const normalizedUsername = username.trim().toLowerCase();
      const normalizedEmail = email.trim().toLowerCase();

      const existingUser = await User.findOne({
        $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
      }).select('_id username email');

      if (existingUser) {
        const message = existingUser.username === normalizedUsername
          ? 'Username already exists'
          : 'Email already exists';

        return res.status(400).json({
          success: false,
          message,
          errors: []
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        username: normalizedUsername,
        email: normalizedEmail,
        password: hashedPassword,
        fullName: fullName.trim(),
        bio: bio.trim()
      });

      const safeUser = await User.findById(user._id).select('-password');
      const token = generateToken(user);

      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        token,
        user: safeUser
      });
    } catch (error) {
      return next(error);
    }
  }
);

router.post(
  '/login',
  [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username: username.trim().toLowerCase() });
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Invalid username or password',
          errors: []
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Invalid username or password',
          errors: []
        });
      }

      const safeUser = await User.findById(user._id).select('-password');
      const token = generateToken(user);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token,
        user: safeUser
      });
    } catch (error) {
      return next(error);
    }
  }
);

export default router;
