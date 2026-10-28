import student from '../models/student.model.js';
import Course from '../models/course.model.js';
import jwt from 'jsonwebtoken';
import { AppError } from '../middlewares/errorHandler.js';
import {
  catchAsync,
  sendResponse,
  validateRequired,
  validateEmail,
  validatePassword,
} from '../utils/asyncHandler.js';

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'program007', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const signup = catchAsync(async (req, res, next) => {
  const { name, password, confirmPassword, email } = req.body;

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

  // Check if student already exists
  const existingStudent = await student.findOne({ email });
  if (existingStudent) {
    return next(new AppError('User already exists with this email', 409));
  }

  // Create new student
  const newStudent = await student.create({
    name: name.trim(),
    password,
    confirmPassword,
    email: email.toLowerCase().trim(),
  });

  // Generate token
  const token = createToken(newStudent._id);

  // Send response
  sendResponse(
    res,
    201,
    {
      token,
      user: {
        id: newStudent._id,
        name: newStudent.name,
        email: newStudent.email,
      },
    },
    'Student account created successfully'
  );
});

const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate required fields
  validateRequired(['email', 'password'], req.body);

  // Validate email format
  validateEmail(email);

  // Check if student exists
  const existingStudent = await student.findOne({
    email: email.toLowerCase().trim(),
  });
  if (!existingStudent) {
    return next(
      new AppError(
        'No student found with this email. Please signup first!',
        404
      )
    );
  }

  // Check password
  const isMatch = await existingStudent.comparePassword(
    password,
    existingStudent.password
  );
  if (!isMatch) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Generate token
  const token = createToken(existingStudent._id);

  // Send response
  sendResponse(
    res,
    200,
    {
      token,
      user: {
        id: existingStudent._id,
        name: existingStudent.name,
        email: existingStudent.email,
      },
    },
    'Login successful'
  );
});

// Dashboard data
const getDashboardData = catchAsync(async (req, res, next) => {
  const studentId = req.user._id;

  // Get student data with enrolled courses
  const studentData = await student
    .findById(studentId)
    .populate('enrolledCourses');

  if (!studentData) {
    return next(new AppError('Student not found', 404));
  }

  // Calculate dashboard stats
  const totalCourses = studentData.enrolledCourses
    ? studentData.enrolledCourses.length
    : 0;

  // Calculate completed courses based on courseProgress array
  const completedCourses = studentData.courseProgress
    ? studentData.courseProgress.filter((progress) => progress.progress === 100)
        .length
    : 0;

  const inProgressCourses = totalCourses - completedCourses;

  // Calculate total learning hours (sum of all enrolled course durations)
  const totalHours = studentData.enrolledCourses
    ? studentData.enrolledCourses.reduce(
        (sum, course) => sum + (course.duration || 0),
        0
      )
    : 0;

  const dashboardData = {
    totalCourses,
    completedCourses,
    inProgressCourses,
    totalHours,
    recentCourses: studentData.enrolledCourses
      ? studentData.enrolledCourses.slice(0, 3)
      : [],
  };

  sendResponse(
    res,
    200,
    { data: dashboardData },
    'Dashboard data retrieved successfully'
  );
}); // Get enrolled courses
const getEnrolledCourses = catchAsync(async (req, res, next) => {
  const studentId = req.user._id;

  const studentData = await student.findById(studentId).populate({
    path: 'enrolledCourses',
    populate: {
      path: 'tutor',
      select: 'name',
    },
  });

  if (!studentData) {
    return next(new AppError('Student not found', 404));
  }

  sendResponse(
    res,
    200,
    { data: { courses: studentData.enrolledCourses || [] } },
    'Enrolled courses retrieved successfully'
  );
});

// Get all available courses
const getAllCourses = catchAsync(async (req, res, next) => {
  const { category, level, search } = req.query;

  let query = {};

  if (category) {
    query.category = category;
  }

  if (level) {
    query.level = level;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const courses = await Course.find(query).populate('tutor', 'name');

  sendResponse(
    res,
    200,
    { data: { courses } },
    'Courses retrieved successfully'
  );
});

// Enroll in a course
const enrollInCourse = catchAsync(async (req, res, next) => {
  const studentId = req.user._id;
  const { courseId } = req.params;

  // Check if course exists
  const courseData = await Course.findById(courseId);
  if (!courseData) {
    return next(new AppError('Course not found', 404));
  }

  // Check if student exists
  const studentData = await student.findById(studentId);
  if (!studentData) {
    return next(new AppError('Student not found', 404));
  }

  // Check if already enrolled
  if (
    studentData.enrolledCourses &&
    studentData.enrolledCourses.includes(courseId)
  ) {
    return next(new AppError('Already enrolled in this course', 400));
  }

  // Add course to student's enrolled courses and initialize progress
  await student.findByIdAndUpdate(
    studentId,
    {
      $addToSet: { enrolledCourses: courseId },
      $push: {
        courseProgress: {
          courseId: courseId,
          progress: 0,
          completedLessons: [],
          lastAccessed: new Date(),
        },
      },
    },
    { new: true }
  );

  // Increment course enrollment count
  courseData.enrollmentCount = (courseData.enrollmentCount || 0) + 1;
  await courseData.save();

  sendResponse(
    res,
    200,
    { data: { message: 'Successfully enrolled in course' } },
    'Course enrollment successful'
  );
});

// Get individual course details for enrolled students
const getCourseDetails = catchAsync(async (req, res, next) => {
  const studentId = req.user._id;
  const { courseId } = req.params;

  // Check if student is enrolled in this course
  const studentData = await student.findById(studentId);
  if (!studentData || !studentData.enrolledCourses.includes(courseId)) {
    return next(new AppError('You are not enrolled in this course', 403));
  }

  // Get detailed course information
  const courseData = await Course.findById(courseId)
    .populate('tutor', 'name email bio qualifications')
    .lean();

  if (!courseData) {
    return next(new AppError('Course not found', 404));
  }

  // Get student's progress for this course
  const progressData = studentData.courseProgress?.find(
    (progress) => progress.courseId.toString() === courseId
  );

  const courseWithProgress = {
    ...courseData,
    studentProgress: {
      progress: progressData?.progress || 0,
      completedLessons: progressData?.completedLessons || [],
      lastAccessed: progressData?.lastAccessed,
    },
  };

  sendResponse(
    res,
    200,
    { data: { course: courseWithProgress } },
    'Course details retrieved successfully'
  );
});

export {
  signup,
  signin,
  getDashboardData,
  getEnrolledCourses,
  getAllCourses,
  enrollInCourse,
  getCourseDetails,
};
