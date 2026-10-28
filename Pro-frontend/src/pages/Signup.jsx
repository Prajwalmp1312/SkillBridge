import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar('Passwords do not match', {
        variant: 'error',
        autoHideDuration: 4000,
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      enqueueSnackbar('Password must be at least 6 characters long', {
        variant: 'error',
        autoHideDuration: 4000,
      });
      setLoading(false);
      return;
    }

    try {
      const endpoint =
        formData.role === 'student'
          ? 'http://localhost:5000/api/v1/student/signup'
          : 'http://localhost:5000/api/v1/tutor/signup';

      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await axios.post(endpoint, payload);

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', formData.role);
        localStorage.setItem('userId', response.data.user.id);

        // Show success message
        enqueueSnackbar('Account created successfully! Redirecting...', {
          variant: 'success',
          autoHideDuration: 2000,
        });

        // Navigate to appropriate dashboard
        setTimeout(() => {
          if (formData.role === 'student') {
            navigate('/student-dashboard');
          } else {
            navigate('/tutor-dashboard');
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMessage =
        error.response?.data?.message || 'Signup failed. Please try again.';
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10'></div>

      <div className='relative max-w-5xl w-full'>
        {/* Header */}
        <div className='text-center mb-4'>
          {/* Back to Welcome Link */}
          <button
            onClick={() => navigate('/')}
            className='inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4 text-sm'
          >
            <svg
              className='w-4 h-4 mr-2'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            Back to Welcome
          </button>

          <div className='mx-auto w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl'>
            <svg
              className='w-6 h-6 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
              />
            </svg>
          </div>

          <h2 className='text-3xl font-bold text-white mb-2'>
            Join SkillBridge
          </h2>
          <p className='text-gray-300 mb-3'>
            Start your learning or teaching journey today
          </p>

          <div className='mb-4 p-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl'>
            <div className='flex items-center mb-1'>
              <svg
                className='w-4 h-4 text-indigo-400 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                />
              </svg>
              <h3 className='text-indigo-300 font-semibold text-sm'>
                Choose Your Path
              </h3>
            </div>
            <div className='text-xs text-gray-300 space-y-1'>
              <p>
                • <strong>Students:</strong> Access premium courses, earn
                certificates, track progress
              </p>
              <p>
                • <strong>Tutors:</strong> Create courses, earn revenue, build
                your teaching brand
              </p>
            </div>
          </div>

          <p className='mt-2 text-center text-sm text-gray-400'>
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className='font-medium text-indigo-400 hover:text-indigo-300 transition-colors'
            >
              Sign in here
            </button>
          </p>
        </div>

        {/* Form Container */}
        <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border border-white/20'>
          <form onSubmit={handleSubmit}>
            {/* Role Selection - Full Width */}
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-200 mb-3'>
                Choose your journey:
              </label>
              <div className='grid grid-cols-2 gap-4'>
                <label className='flex items-center p-3 border border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-all duration-200 group'>
                  <input
                    type='radio'
                    name='role'
                    value='student'
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                    className='h-4 w-4 text-indigo-500 focus:ring-indigo-400 border-gray-300 bg-white/20'
                  />
                  <div className='ml-3'>
                    <span className='block text-sm font-medium text-gray-200 group-hover:text-white'>
                      Student
                    </span>
                    <span className='block text-xs text-gray-400'>
                      Learn new skills
                    </span>
                  </div>
                </label>
                <label className='flex items-center p-3 border border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-all duration-200 group'>
                  <input
                    type='radio'
                    name='role'
                    value='tutor'
                    checked={formData.role === 'tutor'}
                    onChange={handleChange}
                    className='h-4 w-4 text-indigo-500 focus:ring-indigo-400 border-gray-300 bg-white/20'
                  />
                  <div className='ml-3'>
                    <span className='block text-sm font-medium text-gray-200 group-hover:text-white'>
                      Tutor
                    </span>
                    <span className='block text-xs text-gray-400'>
                      Share your expertise
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Two Column Layout for Form Fields */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Left Column */}
              <div className='space-y-3'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-200 mb-2'
                  >
                    Full Name
                  </label>
                  <input
                    id='name'
                    name='name'
                    type='text'
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className='relative block w-full px-4 py-3 border border-gray-300/30 rounded-2xl placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-200'
                    placeholder='Enter your full name'
                  />
                </div>

                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-200 mb-2'
                  >
                    Email address
                  </label>
                  <input
                    id='email'
                    name='email'
                    type='email'
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className='relative block w-full px-4 py-3 border border-gray-300/30 rounded-2xl placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-200'
                    placeholder='Enter your email address'
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className='space-y-3'>
                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-200 mb-2'
                  >
                    Password
                  </label>
                  <input
                    id='password'
                    name='password'
                    type='password'
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className='relative block w-full px-4 py-3 border border-gray-300/30 rounded-2xl placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-200'
                    placeholder='Enter your password'
                  />
                </div>

                <div>
                  <label
                    htmlFor='confirmPassword'
                    className='block text-sm font-medium text-gray-200 mb-2'
                  >
                    Confirm Password
                  </label>
                  <input
                    id='confirmPassword'
                    name='confirmPassword'
                    type='password'
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className='relative block w-full px-4 py-3 border border-gray-300/30 rounded-2xl placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent backdrop-blur-sm transition-all duration-200'
                    placeholder='Confirm your password'
                  />
                </div>
              </div>
            </div>

            {/* Submit Button - Full Width */}
            <div className='mt-5'>
              <button
                type='submit'
                disabled={loading}
                className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Creating your account...
                  </div>
                ) : (
                  <>
                    <svg
                      className='w-5 h-5 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                      />
                    </svg>
                    Create My Account
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Helpful Information */}
          <div className='mt-4 p-3 bg-white/5 rounded-xl border border-white/10'>
            <div className='flex items-center mb-1'>
              <svg
                className='w-4 h-4 text-green-400 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <span className='text-green-400 text-xs font-medium'>
                What happens next?
              </span>
            </div>
            <div className='text-xs text-gray-400 space-y-1'>
              <p>
                • Instant account activation - no email verification required
              </p>
              <p>
                • Access to{' '}
                {formData.role === 'student'
                  ? 'course catalog and learning materials'
                  : 'course creation tools and analytics'}
              </p>
              <p>• Free account with premium features available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
