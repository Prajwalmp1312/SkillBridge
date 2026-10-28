import express from 'express';
import {
  signup,
  signin,
  getDashboardStats,
  getAllStudents,
  getAllTutors,
} from '../controllers/admin.controllers.js';
import { authAdmin } from '../middlewares/auth.js';
import { validateFields, sanitizeInput } from '../middlewares/validation.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

// Apply rate limiting to all admin routes
router.use(apiLimiter);

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Public admin routes
router.post(
  '/signup',
  validateFields(['name', 'email', 'password', 'confirmPassword']),
  signup
);

router.post('/signin', validateFields(['email', 'password']), signin);

// Protected admin routes
router.get('/dashboard/stats', authAdmin, getDashboardStats);
router.get('/students', authAdmin, getAllStudents);
router.get('/tutors', authAdmin, getAllTutors);

export default router;
  