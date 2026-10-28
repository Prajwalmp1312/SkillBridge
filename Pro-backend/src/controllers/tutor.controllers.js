import Tutor from '../models/tutor.model.js';
import Course from '../models/course.model.js';
import Student from '../models/student.model.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler.js';
import {
  catchAsync,
  sendResponse,
  validateRequired,
  validateEmail,
} from '../utils/asyncHandler.js';

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'tutorSecret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  // Validate required fields
  validateRequired(['name', 'email', 'password', 'confirmPassword'], req.body);

  // Validate email format
  validateEmail(email);

  // Validate password strength
  if (password.length < 6) {
    return next(
      new AppError('Password must be at least 6 characters long', 400)
    );
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return next(
      new AppError('Password and confirm password do not match', 400)
    );
  }

  // Check if tutor already exists
  const existingTutor = await Tutor.findOne({
    email: email.toLowerCase().trim(),
  });
  if (existingTutor) {
    return next(
      new AppError('Tutor already exists with this email. Please login!', 409)
    );
  }

  // Create new tutor
  const newTutor = await Tutor.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    confirmPassword,
  });

  // Generate token
  const token = createToken(newTutor._id);

  // Send response
  sendResponse(
    res,
    201,
    {
      token,
      user: {
        id: newTutor._id,
        name: newTutor.name,
        email: newTutor.email,
      },
    },
    'Tutor account created successfully'
  );
});

const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate required fields
  validateRequired(['email', 'password'], req.body);

  // Validate email format
  validateEmail(email);

  // Check if tutor exists
  const existingTutor = await Tutor.findOne({
    email: email.toLowerCase().trim(),
  });
  if (!existingTutor) {
    return next(
      new AppError('No tutor found with this email. Please signup first!', 404)
    );
  }

  // Check password
  const isMatch = await existingTutor.comparePassword(
    password,
    existingTutor.password
  );
  if (!isMatch) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Generate token
  const token = createToken(existingTutor._id);

  // Send response
  sendResponse(
    res,
    200,
    {
      token,
      user: {
        id: existingTutor._id,
        name: existingTutor.name,
        email: existingTutor.email,
      },
    },
    'Login successful'
  );
});

// Get tutor dashboard statistics
const getDashboardStats = catchAsync(async (req, res, next) => {
  const tutorId = req.user._id;

  // Get all courses by this tutor
  const courses = await Course.find({ tutor: tutorId });

  // Calculate statistics
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(
    (course) => course.isPublished
  ).length;
  const draftCourses = totalCourses - publishedCourses;

  // Calculate total students enrolled across all courses
  const totalStudents = courses.reduce(
    (sum, course) => sum + (course.enrollmentCount || 0),
    0
  );

  // Calculate total revenue (assuming price * enrollmentCount)
  const totalRevenue = courses.reduce((sum, course) => {
    return sum + (course.price || 0) * (course.enrollmentCount || 0);
  }, 0);

  // Calculate average rating
  const coursesWithRatings = courses.filter((course) => course.rating > 0);
  const averageRating =
    coursesWithRatings.length > 0
      ? coursesWithRatings.reduce((sum, course) => sum + course.rating, 0) /
        coursesWithRatings.length
      : 0;

  const stats = {
    totalCourses,
    publishedCourses,
    draftCourses,
    totalStudents,
    totalRevenue,
    averageRating,
  };

  sendResponse(res, 200, { stats }, 'Dashboard stats retrieved successfully');
});

// Get tutor's courses
const getTutorCourses = catchAsync(async (req, res, next) => {
  const tutorId = req.user._id;
  const { page = 1, limit = 10, status, search } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  // Build filter
  let filter = { tutor: tutorId };

  if (status) {
    if (status === 'published') {
      filter.isPublished = true;
    } else if (status === 'draft') {
      filter.isPublished = false;
    }
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ];
  }

  // Get courses with pagination
  const courses = await Course.find(filter)
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .populate('tutor', 'name email');

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

// Create new course
const createCourse = catchAsync(async (req, res, next) => {
  const tutorId = req.user._id;
  const courseData = {
    ...req.body,
    tutor: tutorId,
  };

  validateRequired(['title', 'description', 'category'], courseData);

  const course = new Course(courseData);
  const savedCourse = await course.save();

  sendResponse(
    res,
    201,
    { course: savedCourse },
    'Course created successfully'
  );
});

// Update course
const updateCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const tutorId = req.user._id;

  // Find course and verify ownership
  const course = await Course.findOne({ _id: courseId, tutor: tutorId });
  if (!course) {
    return next(new AppError('Course not found or unauthorized', 404));
  }

  // Update course
  Object.assign(course, req.body);
  const updatedCourse = await course.save();

  sendResponse(
    res,
    200,
    { course: updatedCourse },
    'Course updated successfully'
  );
});

// Delete course
const deleteCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const tutorId = req.user._id;

  // Find and delete course
  const course = await Course.findOneAndDelete({
    _id: courseId,
    tutor: tutorId,
  });
  if (!course) {
    return next(new AppError('Course not found or unauthorized', 404));
  }

  sendResponse(res, 200, {}, 'Course deleted successfully');
});

// Get tutor's students
const getTutorStudents = catchAsync(async (req, res, next) => {
  const tutorId = req.user._id;

  // Get all courses by this tutor
  const courses = await Course.find({ tutor: tutorId }).select('_id title');
  const courseIds = courses.map((course) => course._id);

  // For now, return empty array since we need enrollment model
  // In a real app, you'd query an Enrollment model
  const students = [];

  sendResponse(
    res,
    200,
    {
      students,
      courses: courses.map((course) => ({
        id: course._id,
        title: course.title,
        enrollmentCount: 0, // Would come from enrollment model
      })),
    },
    'Students retrieved successfully'
  );
});

export {
  signup,
  signin,
  getDashboardStats,
  getTutorCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getTutorStudents,
};
