import express from 'express';
import {
  signin,
  signup,
  getDashboardStats,
  getTutorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getTutorStudents,
} from '../controllers/tutor.controllers.js';
import {
  validateSignup,
  validateSignin,
  sanitizeInput,
} from '../middlewares/validation.js';
import { authLimiter, apiLimiter } from '../middlewares/rateLimiter.js';
import { authTutor } from '../middlewares/auth.js';

let router = express.Router();

// Apply rate limiting
router.use('/signup', authLimiter);
router.use('/signin', authLimiter);
router.use(apiLimiter);

// Tutor authentication routes
router.post('/signup', sanitizeInput, validateSignup, signup);
router.post('/signin', sanitizeInput, validateSignin, signin);

// Protected routes
router.get('/profile', authTutor, (req, res) => {
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
router.get('/dashboard/stats', authTutor, getDashboardStats);
router.get('/courses', authTutor, getTutorCourses);
router.post('/courses', authTutor, createCourse);
router.put('/courses/:courseId', authTutor, updateCourse);
router.delete('/courses/:courseId', authTutor, deleteCourse);
router.get('/students', authTutor, getTutorStudents);

export default router;
