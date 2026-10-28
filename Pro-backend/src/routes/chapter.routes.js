import express from 'express';
import {
  addChapter,
  updateChapter,
  deleteChapter,
  reorderChapters,
} from '../controllers/chapter.controllers.js';
import { authTutor } from '../middlewares/auth.js';
import { validateFields, sanitizeInput } from '../middlewares/validation.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router({ mergeParams: true });

// Apply rate limiting to all chapter routes
router.use(apiLimiter);

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Reorder chapters (requires tutor authentication, must be before /:chapterId routes)
router.patch(
  '/reorder',
  authTutor,
  validateFields(['chapterIds']),
  reorderChapters
);

// Add a new chapter to a course (requires tutor authentication)
router.post('/', authTutor, validateFields(['title']), addChapter);

// Update a specific chapter (requires tutor authentication)
router.put('/:chapterId', authTutor, updateChapter);

// Delete a chapter (requires tutor authentication)
router.delete('/:chapterId', authTutor, deleteChapter);

export default router;
