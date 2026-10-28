import { AppError } from './errorHandler.js';

// Validation middleware
export const validateSignup = (req, res, next) => {
  const { name, email, password, confirmPassword } = req.body;

  // Check required fields
  if (!name || !email || !password || !confirmPassword) {
    return next(
      new AppError(
        'All fields are required: name, email, password, confirmPassword',
        400
      )
    );
  }

  // Validate name
  if (name.trim().length < 2) {
    return next(new AppError('Name must be at least 2 characters long', 400));
  }

  if (name.trim().length > 50) {
    return next(new AppError('Name must not exceed 50 characters', 400));
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  // Validate password strength
  if (password.length < 6) {
    return next(
      new AppError('Password must be at least 6 characters long', 400)
    );
  }

  if (password.length > 128) {
    return next(new AppError('Password must not exceed 128 characters', 400));
  }

  // Check if passwords match
  if (password !== confirmPassword) {
    return next(
      new AppError('Password and confirm password do not match', 400)
    );
  }

  next();
};

export const validateSignin = (req, res, next) => {
  const { email, password } = req.body;

  // Check required fields
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  next();
};

// Generic field validation
export const validateFields = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = [];

    requiredFields.forEach((field) => {
      if (
        !req.body[field] ||
        (typeof req.body[field] === 'string' && req.body[field].trim() === '')
      ) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      return next(
        new AppError(
          `Missing required fields: ${missingFields.join(', ')}`,
          400
        )
      );
    }

    next();
  };
};

// Sanitize input data
export const sanitizeInput = (req, res, next) => {
  // Sanitize string fields
  for (let key in req.body) {
    if (typeof req.body[key] === 'string') {
      req.body[key] = req.body[key].trim();

      // Convert email to lowercase
      if (key === 'email') {
        req.body[key] = req.body[key].toLowerCase();
      }
    }
  }

  next();
};
