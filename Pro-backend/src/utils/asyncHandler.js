// Async error wrapper to catch async errors automatically
export const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

// Response utility functions
export const sendResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    success: true,
    status: statusCode < 400 ? 'success' : 'fail',
    message,
    ...data,
  });
};

export const sendError = (res, statusCode, message) => {
  res.status(statusCode).json({
    success: false,
    status: statusCode < 500 ? 'fail' : 'error',
    message,
  });
};

// Validation utilities
export const validateRequired = (fields, body) => {
  const missing = fields.filter(
    (field) => !body[field] || body[field].trim() === ''
  );
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please provide a valid email address');
  }
};

export const validatePassword = (password) => {
  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Optional: Strong password validation
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
  if (!strongPasswordRegex.test(password)) {
    throw new Error(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    );
  }
};
