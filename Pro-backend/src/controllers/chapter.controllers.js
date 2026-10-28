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

// Add a new chapter to a course
export const addChapter = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { title, description, order = 0 } = req.body;

  if (!isValidObjectId(courseId)) {
    return next(new AppError('Invalid course ID format', 400));
  }

  validateRequired(['title'], req.body);

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const newChapter = {
    title: title.trim(),
    description: description?.trim(),
    order: parseInt(order) || 0,
    subchapters: [],
  };

  course.chapters.push(newChapter);
  await course.save();

  const addedChapter = course.chapters[course.chapters.length - 1];

  logger.info('Chapter added successfully', {
    courseId,
    chapterId: addedChapter._id,
    title: addedChapter.title,
  });

  sendResponse(
    res,
    201,
    {
      chapter: addedChapter,
    },
    'Chapter added successfully'
  );
});

// Update a chapter
export const updateChapter = catchAsync(async (req, res, next) => {
  const { courseId, chapterId } = req.params;
  const updates = req.body;

  if (!isValidObjectId(courseId) || !isValidObjectId(chapterId)) {
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

  // Clean up updates
  if (updates.title) updates.title = updates.title.trim();
  if (updates.description) updates.description = updates.description.trim();
  if (updates.order) updates.order = parseInt(updates.order);

  Object.assign(chapter, updates);
  await course.save();

  logger.info('Chapter updated successfully', {
    courseId,
    chapterId,
    updatedFields: Object.keys(updates),
  });

  sendResponse(res, 200, { chapter }, 'Chapter updated successfully');
});

// Delete a chapter
export const deleteChapter = catchAsync(async (req, res, next) => {
  const { courseId, chapterId } = req.params;

  if (!isValidObjectId(courseId) || !isValidObjectId(chapterId)) {
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

  course.chapters.pull(chapterId);
  await course.save();

  logger.info('Chapter deleted successfully', {
    courseId,
    chapterId,
    title: chapter.title,
  });

  sendResponse(res, 200, {}, 'Chapter deleted successfully');
});

// Reorder chapters
export const reorderChapters = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const { chapterIds } = req.body;

  if (!isValidObjectId(courseId)) {
    return next(new AppError('Invalid course ID format', 400));
  }

  if (!Array.isArray(chapterIds)) {
    return next(new AppError('chapterIds must be an array', 400));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (chapterIds.length !== course.chapters.length) {
    return next(
      new AppError('Chapter IDs length must match existing chapters count', 400)
    );
  }

  const reorderedChapters = chapterIds
    .map((id) =>
      course.chapters.find((chapter) => chapter._id.toString() === id)
    )
    .filter(Boolean);

  if (reorderedChapters.length !== course.chapters.length) {
    return next(new AppError('Some chapter IDs are invalid', 400));
  }

  course.chapters = reorderedChapters;
  await course.save();

  logger.info('Chapters reordered successfully', {
    courseId,
    newOrder: chapterIds,
  });

  sendResponse(
    res,
    200,
    { chapters: course.chapters },
    'Chapters reordered successfully'
  );
});
