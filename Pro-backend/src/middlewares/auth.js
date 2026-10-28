import jwt from 'jsonwebtoken';
import Tutor from '../models/tutor.model.js';
import Student from '../models/student.model.js';
import Admin from '../models/admin.model.js';
import { AppError } from './errorHandler.js';
import { catchAsync } from '../utils/asyncHandler.js';

// Authentication middleware for tutors
export const authTutor = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tutorSecret');

  // 3) Check if tutor still exists
  const currentTutor = await Tutor.findById(decoded.id);
  if (!currentTutor) {
    return next(
      new AppError('The tutor belonging to this token no longer exists.', 401)
    );
  }

  // 4) Grant access to protected route
  req.user = currentTutor;
  req.tutorId = currentTutor._id;
  next();
});

// Authentication middleware for students
export const authStudent = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'program007');

  // 3) Check if student still exists
  const currentStudent = await Student.findById(decoded.id);
  if (!currentStudent) {
    return next(
      new AppError('The student belonging to this token no longer exists.', 401)
    );
  }

  // 4) Grant access to protected route
  req.user = currentStudent;
  req.studentId = currentStudent._id;
  next();
});

// Generic authentication middleware (for both tutors and students)
export const authenticate = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'program007');
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(
        new AppError('Your token has expired! Please log in again.', 401)
      );
    }
    return next(error);
  }

  // 3) Check if user still exists (try both tutor and student)
  let currentUser = await Tutor.findById(decoded.id);
  let userType = 'tutor';

  if (!currentUser) {
    currentUser = await Student.findById(decoded.id);
    userType = 'student';
  }

  if (!currentUser) {
    return next(
      new AppError('The user belonging to this token no longer exists.', 401)
    );
  }

  // 4) Grant access to protected route
  req.user = currentUser;
  req.userType = userType;
  if (userType === 'tutor') {
    req.tutorId = currentUser._id;
  } else {
    req.studentId = currentUser._id;
  }

  next();
});

// Legacy auth function (keeping for backward compatibility)
export const auth = authTutor;

// Authentication middleware for admins
export const authAdmin = catchAsync(async (req, res, next) => {
  // 1) Get token and check if it exists
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(
      new AppError('You are not logged in! Please log in to get access.', 401)
    );
  }

  // 2) Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || 'rcb18');
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    } else if (error.name === 'TokenExpiredError') {
      return next(
        new AppError('Your token has expired! Please log in again.', 401)
      );
    }
    return next(error);
  }

  // 3) Check if admin still exists and has admin role
  const currentAdmin = await Admin.findById(decoded.id);
  if (!currentAdmin || decoded.role !== 'admin') {
    return next(new AppError('Access denied. Admin privileges required.', 403));
  }

  // 4) Grant access to protected route
  req.user = currentAdmin;
  req.adminId = currentAdmin._id;
  next();
});
