import Course from '../models/course.model.js';
import { AppError } from '../middlewares/errorHandler.js';
import {
  catchAsync,
  sendResponse,
  validateRequired,
} from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => id.match(/^[0-9a-fA-F]{24}$/);

// Add a new subchapter to a chapter
export const addSubchapter = catchAsync(async (req, res, next) => {
  const { courseId, chapterId } = req.params;
  const { title, content, order = 0 } = req.body;

  if (!isValidObjectId(courseId) || !isValidObjectId(chapterId)) {
    return next(new AppError('Invalid ID format', 400));
  }

  validateRequired(['title'], req.body);

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const chapter = course.chapters.id(chapterId);
  if (!chapter) {
    return next(new AppError('Chapter not found', 404));
  }

  const newSubchapter = {
    title: title.trim(),
    content: content?.trim(),
    order: parseInt(order) || 0,
  };

  chapter.subchapters.push(newSubchapter);
  await course.save();

  const addedSubchapter = chapter.subchapters[chapter.subchapters.length - 1];

  logger.info('Subchapter added successfully', {
    courseId,
    chapterId,
    subchapterId: addedSubchapter._id,
    title: addedSubchapter.title,
  });

  sendResponse(
    res,
    201,
    {
      subchapter: addedSubchapter,
    },
    'Subchapter added successfully'
  );
});

// Update a subchapter
export const updateSubchapter = catchAsync(async (req, res, next) => {
  const { courseId, chapterId, subchapterId } = req.params;
  const updates = req.body;

  if (
    !isValidObjectId(courseId) ||
    !isValidObjectId(chapterId) ||
    !isValidObjectId(subchapterId)
  ) {
    return next(new AppError('Invalid ID format', 400));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const chapter = course.chapters.id(chapterId);
  if (!chapter) {
    return next(new AppError('Chapter not found', 404));
  }

  const subchapter = chapter.subchapters.id(subchapterId);
  if (!subchapter) {
    return next(new AppError('Subchapter not found', 404));
  }

  // Clean up updates
  if (updates.title) updates.title = updates.title.trim();
  if (updates.content) updates.content = updates.content.trim();
  if (updates.order) updates.order = parseInt(updates.order);

  Object.assign(subchapter, updates);
  await course.save();

  logger.info('Subchapter updated successfully', {
    courseId,
    chapterId,
    subchapterId,
    updatedFields: Object.keys(updates),
  });

  sendResponse(res, 200, { subchapter }, 'Subchapter updated successfully');
});

// Delete a subchapter
export const deleteSubchapter = catchAsync(async (req, res, next) => {
  const { courseId, chapterId, subchapterId } = req.params;

  if (
    !isValidObjectId(courseId) ||
    !isValidObjectId(chapterId) ||
    !isValidObjectId(subchapterId)
  ) {
    return next(new AppError('Invalid ID format', 400));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const chapter = course.chapters.id(chapterId);
  if (!chapter) {
    return next(new AppError('Chapter not found', 404));
  }

  const subchapter = chapter.subchapters.id(subchapterId);
  if (!subchapter) {
    return next(new AppError('Subchapter not found', 404));
  }

  chapter.subchapters.pull(subchapterId);
  await course.save();

  logger.info('Subchapter deleted successfully', {
    courseId,
    chapterId,
    subchapterId,
    title: subchapter.title,
  });

  sendResponse(res, 200, {}, 'Subchapter deleted successfully');
});

// Get a specific subchapter
export const getSubchapter = catchAsync(async (req, res, next) => {
  const { courseId, chapterId, subchapterId } = req.params;

  if (
    !isValidObjectId(courseId) ||
    !isValidObjectId(chapterId) ||
    !isValidObjectId(subchapterId)
  ) {
    return next(new AppError('Invalid ID format', 400));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const chapter = course.chapters.id(chapterId);
  if (!chapter) {
    return next(new AppError('Chapter not found', 404));
  }

  const subchapter = chapter.subchapters.id(subchapterId);
  if (!subchapter) {
    return next(new AppError('Subchapter not found', 404));
  }

  sendResponse(res, 200, { subchapter }, 'Subchapter retrieved successfully');
});
