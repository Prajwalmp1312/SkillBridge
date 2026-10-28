import express from 'express';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  getCourseStats,
} from '../controllers/course.controllers.js';
import { authTutor, authenticate } from '../middlewares/auth.js';
import { validateFields, sanitizeInput } from '../middlewares/validation.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';

// Import nested route handlers
import chapterRoutes from './chapter.routes.js';
import subchapterRoutes from './subchapter.routes.js';

const router = express.Router();

// Apply rate limiting to all course routes
router.use(apiLimiter);

// Apply input sanitization to all routes
router.use(sanitizeInput);

// ===== COURSE ROUTES =====
// Create a new course (requires tutor authentication)
router.post(
  '/',
  authTutor,
  validateFields(['title', 'description', 'category', 'level']),
  createCourse
);

// Get all courses with filtering and pagination (public)
router.get('/', getAllCourses);

// Get course statistics (must be before /:id route)
router.get('/:courseId/stats', authenticate, getCourseStats);

// Publish/Unpublish course (requires tutor authentication)
router.patch('/:courseId/publish', authTutor, publishCourse);
router.patch('/:courseId/unpublish', authTutor, unpublishCourse);

// Get a specific course by ID (public)
router.get('/:id', getCourseById);

// Update course basic information (requires tutor authentication)
router.put('/:id', authTutor, updateCourse);

// Delete a course (requires tutor authentication)
router.delete('/:id', authTutor, deleteCourse);

// ===== NESTED ROUTES =====
// Chapter routes - all routes under /:courseId/chapters
router.use('/:courseId/chapters', chapterRoutes);

// Subchapter routes - all routes under /:courseId/chapters/:chapterId/subchapters
router.use('/:courseId/chapters/:chapterId/subchapters', subchapterRoutes);

export default router;
