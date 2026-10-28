import express from 'express';
import {
  signin,
  signup,
  getDashboardData,
  getEnrolledCourses,
  getAllCourses,
  enrollInCourse,
  getCourseDetails,
} from '../controllers/student.controllers.js';
import {
  validateSignup,
  validateSignin,
  sanitizeInput,
} from '../middlewares/validation.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { authStudent } from '../middlewares/auth.js';

let router = express.Router();

// Student authentication routes
router.post('/signup', authLimiter, sanitizeInput, validateSignup, signup);
router.post('/signin', authLimiter, sanitizeInput, validateSignin, signin);

// Protected routes
router.get('/profile', authStudent, (req, res) => {
  res.status(200).json({
    success: true,
    status: 'success',
    message: 'Profile retrieved successfully',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

// Dashboard routes
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student routes are working',
    timestamp: new Date().toISOString(),
  });
});

router.get('/test-auth', authStudent, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication is working',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
    },
  });
});

router.get('/dashboard', authStudent, getDashboardData);
router.get('/enrolled-courses', authStudent, getEnrolledCourses);
router.get('/courses', authStudent, getAllCourses);
router.get('/course/:courseId', authStudent, getCourseDetails);
router.post('/enroll/:courseId', authStudent, enrollInCourse);

export default router;
