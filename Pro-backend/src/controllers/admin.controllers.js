import Admin from '../models/admin.model.js';
import Student from '../models/student.model.js';
import Tutor from '../models/tutor.model.js';
import Course from '../models/course.model.js';
import { AppError } from '../middlewares/errorHandler.js';
import {
  catchAsync,
  sendResponse,
  validateRequired,
} from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';
import jwt from 'jsonwebtoken';

// Helper function to create JWT token
const createToken = (id) => {
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET || 'rcb18', {
    expiresIn: '14d',
  });
};

// Admin signup
export const signup = catchAsync(async (req, res, next) => {
  const { name, email, password, confirmPassword, adminSecretKey } = req.body;

  // Validate required fields
  validateRequired(
    ['name', 'email', 'password', 'confirmPassword', 'adminSecretKey'],
    req.body
  );

  // Verify admin secret key
  const ADMIN_SECRET_KEY =
    process.env.ADMIN_SECRET_KEY || 'SKILLBRIDGE_ADMIN_2025_SECRET';
  if (adminSecretKey !== ADMIN_SECRET_KEY) {
    return next(
      new AppError('Invalid admin secret key. Unauthorized access.', 403)
    );
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({
    $or: [{ email }, { name }],
  });

  if (existingAdmin) {
    return next(
      new AppError('Admin already exists with this email or name', 400)
    );
  }

  // Create admin
  const admin = new Admin({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  });

  const savedAdmin = await admin.save();

  // Create token
  const token = createToken(savedAdmin._id);

  logger.info('Admin registered successfully', {
    adminId: savedAdmin._id,
    name: savedAdmin.name,
    email: savedAdmin.email,
  });

  sendResponse(
    res,
    201,
    {
      admin: {
        id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email,
      },
      token,
    },
    'Admin registered successfully'
  );
});

// Admin signin
export const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate required fields
  validateRequired(['email', 'password'], req.body);

  // Find admin by email
  const admin = await Admin.findOne({ email: email.trim().toLowerCase() });

  if (!admin) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Check password
  const isMatch = await admin.comparePassword(password);

  if (!isMatch) {
    return next(new AppError('Invalid email or password', 401));
  }

  // Create token
  const token = createToken(admin._id);

  logger.info('Admin signed in successfully', {
    adminId: admin._id,
    email: admin.email,
  });

  sendResponse(
    res,
    200,
    {
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
      token,
    },
    'Admin signed in successfully'
  );
});

// Get admin dashboard stats
export const getDashboardStats = catchAsync(async (req, res, next) => {
  const [totalStudents, totalTutors, totalCourses, publishedCourses] =
    await Promise.all([
      Student.countDocuments(),
      Tutor.countDocuments(),
      Course.countDocuments(),
      Course.countDocuments({ isPublished: true }),
    ]);

  const stats = {
    totalStudents,
    totalTutors,
    totalCourses,
    publishedCourses,
    unpublishedCourses: totalCourses - publishedCourses,
  };

  sendResponse(res, 200, { stats }, 'Dashboard stats retrieved successfully');
});

// Get all students (admin only)
export const getAllStudents = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const students = await Student.find(filter)
    .select('-password')
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .sort({ createdAt: -1 });

  const total = await Student.countDocuments(filter);

  sendResponse(
    res,
    200,
    {
      students,
      pagination: {
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        total,
        limit: limitNum,
      },
    },
    'Students retrieved successfully'
  );
});

// Get all tutors (admin only)
export const getAllTutors = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  let filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const tutors = await Tutor.find(filter)
    .select('-password')
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .sort({ createdAt: -1 });

  const total = await Tutor.countDocuments(filter);

  sendResponse(
    res,
    200,
    {
      tutors,
      pagination: {
        totalPages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        total,
        limit: limitNum,
      },
    },
    'Tutors retrieved successfully'
  );
});
