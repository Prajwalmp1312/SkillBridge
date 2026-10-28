import express from 'express';
import {
  addSubchapter,
  updateSubchapter,
  deleteSubchapter,
  getSubchapter,
} from '../controllers/subchapter.controllers.js';
import { authTutor, authenticate } from '../middlewares/auth.js';
import { validateFields, sanitizeInput } from '../middlewares/validation.js';
import { apiLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router({ mergeParams: true });

// Apply rate limiting to all subchapter routes
router.use(apiLimiter);

// Apply input sanitization to all routes
router.use(sanitizeInput);

// Add a new subchapter to a chapter (requires tutor authentication)
router.post('/', authTutor, validateFields(['title']), addSubchapter);

// Get a specific subchapter (authenticated users only)
router.get('/:subchapterId', authenticate, getSubchapter);

// Update a specific subchapter (requires tutor authentication)
router.put('/:subchapterId', authTutor, updateSubchapter);

// Delete a subchapter (requires tutor authentication)
router.delete('/:subchapterId', authTutor, deleteSubchapter);

export default router;
