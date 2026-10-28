import Course from '../models/course.model.js';
import Tutor from '../models/tutor.model.js';
import { AppError } from '../middlewares/errorHandler.js';
import {
  catchAsync,
  sendResponse,
  validateRequired,
} from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => id.match(/^[0-9a-fA-F]{24}$/);

// Create a new course
export const createCourse = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    shortDescription,
    category,
    level,
    price,
    tutorId,
  } = req.body;

  // Validate required fields
  validateRequired(
    ['title', 'description', 'category', 'level', 'tutorId'],
    req.body
  );

  // Validate price
  if (price !== undefined && (isNaN(price) || price < 0)) {
    return next(new AppError('Price must be a valid positive number', 400));
  }

  // Verify tutor exists
  const tutor = await Tutor.findById(tutorId);
  if (!tutor) {
    return next(new AppError('Tutor not found', 404));
  }

  // Create course
  const course = new Course({
    title: title.trim(),
    description: description.trim(),
    shortDescription: shortDescription?.trim(),
    category: category.trim(),
    level,
    price: price || 0,
    tutor: tutorId,
  });

  const savedCourse = await course.save();
  await savedCourse.populate('tutor', 'name email');

  logger.info('Course created successfully', {
    courseId: savedCourse._id,
    title: savedCourse.title,
    tutorId: tutorId,
  });

  sendResponse(
    res,
    201,
    {
      course: savedCourse,
    },
    'Course created successfully'
  );
});

// Get all courses
export const getAllCourses = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, category, level, search } = req.query;

  // Validate pagination parameters
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
    return next(
      new AppError(
        'Invalid pagination parameters. Page must be >= 1, limit must be between 1-100',
        400
      )
    );
  }

  let filter = {};
  if (category) filter.category = category;
  if (level) filter.level = level;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const courses = await Course.find(filter)
    .populate('tutor', 'name email')
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .sort({ createdAt: -1 });

  const total = await Course.countDocuments(filter);

  sendResponse(
    res,
    200,
    {
      courses,
      pagination: {
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        total,
        limit: limitNum,
      },
    },
    'Courses retrieved successfully'
  );
});

// Get course by ID with full structure
export const getCourseById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid course ID format', 400));
  }

  const course = await Course.findById(id).populate('tutor', 'name email');

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  sendResponse(res, 200, { course }, 'Course retrieved successfully');
});

// Update course basic information
export const updateCourse = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid course ID format', 400));
  }

  // Remove fields that shouldn't be updated directly
  delete updates.tutor;
  delete updates.createdAt;
  delete updates.updatedAt;
  delete updates.chapters;

  // Validate price if provided
  if (
    updates.price !== undefined &&
    (isNaN(updates.price) || updates.price < 0)
  ) {
    return next(new AppError('Price must be a valid positive number', 400));
  }

  const course = await Course.findByIdAndUpdate(
    id,
    { ...updates, updatedAt: new Date() },
    { new: true, runValidators: true }
  ).populate('tutor', 'name email');

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  logger.info('Course updated successfully', {
    courseId: id,
    updatedFields: Object.keys(updates),
  });

  sendResponse(res, 200, { course }, 'Course updated successfully');
});

// Delete course
export const deleteCourse = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return next(new AppError('Invalid course ID format', 400));
  }

  const course = await Course.findByIdAndDelete(id);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  logger.info('Course deleted successfully', {
    courseId: id,
    title: course.title,
  });

  sendResponse(res, 200, {}, 'Course deleted successfully');
});

// ===== CHAPTER MANAGEMENT =====

// Add a new chapter to a course
export const publishCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  if (!isValidObjectId(courseId)) {
    return next(new AppError('Invalid course ID format', 400));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (course.isPublished) {
    return next(new AppError('Course is already published', 400));
  }

  // Validate course has minimum content before publishing
  if (course.chapters.length === 0) {
    return next(new AppError('Cannot publish course without chapters', 400));
  }

  course.isPublished = true;
  course.publishedAt = new Date();
  await course.save();

  logger.info('Course published successfully', {
    courseId,
    title: course.title,
  });

  sendResponse(res, 200, { course }, 'Course published successfully');
});

// Unpublish course
export const unpublishCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  if (!isValidObjectId(courseId)) {
    return next(new AppError('Invalid course ID format', 400));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (!course.isPublished) {
    return next(new AppError('Course is not published', 400));
  }

  course.isPublished = false;
  course.publishedAt = null;
  await course.save();

  logger.info('Course unpublished successfully', {
    courseId,
    title: course.title,
  });

  sendResponse(res, 200, { course }, 'Course unpublished successfully');
});

// Get course statistics
export const getCourseStats = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;

  if (!isValidObjectId(courseId)) {
    return next(new AppError('Invalid course ID format', 400));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const stats = {
    chaptersCount: course.chapters.length,
    subchaptersCount: course.chapters.reduce(
      (total, chapter) => total + chapter.subchapters.length,
      0
    ),
    isPublished: course.isPublished,
    publishedAt: course.publishedAt,
    createdAt: course.createdAt,
    updatedAt: course.updatedAt,
  };

  sendResponse(res, 200, { stats }, 'Course statistics retrieved successfully');
});
