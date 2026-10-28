import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    try {
      const endpoint =
        formData.role === 'student'
          ? 'http://localhost:5000/api/v1/student/signin'
          : 'http://localhost:5000/api/v1/tutor/signin';

      const response = await axios.post(endpoint, {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', formData.role);
        localStorage.setItem('userId', response.data.user.id);

        // Show success message
        enqueueSnackbar('Login successful! Redirecting...', {
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
      console.error('Login error:', error);
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';
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

      <div className='relative max-w-4xl w-full space-y-6'>
        {/* Header */}
        <div className='text-center'>
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
                d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
              />
            </svg>
          </div>

          <h2 className='text-3xl font-bold text-white mb-2'>Welcome Back</h2>
          <p className='text-gray-300 mb-3'>
            Sign in to continue your learning journey
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
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
              <h3 className='text-indigo-300 font-semibold text-sm'>
                Quick Access
              </h3>
            </div>
            <div className='text-xs text-gray-300 space-y-1'>
              <p>
                • <strong>Students:</strong> Access courses, track progress,
                submit assignments
              </p>
              <p>
                • <strong>Tutors:</strong> Manage courses, view analytics,
                interact with students
              </p>
            </div>
          </div>

          <p className='mt-4 text-center text-sm text-gray-400'>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className='font-medium text-indigo-400 hover:text-indigo-300 transition-colors'
            >
              Create one here
            </button>
          </p>
        </div>

        {/* Form Container */}
        <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20'>
          <form
            className='space-y-4'
            onSubmit={handleSubmit}
          >
            {/* Role Selection */}
            <div>
              <label className='block text-sm font-medium text-white mb-3'>
                Select your role:
              </label>
              <div className='grid grid-cols-2 gap-4'>
                <label className='flex items-center p-4 border border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-all duration-200 group'>
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
                      Learn & grow
                    </span>
                  </div>
                </label>
                <label className='flex items-center p-4 border border-white/20 rounded-xl cursor-pointer hover:bg-white/5 transition-all duration-200 group'>
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
                      Teach & inspire
                    </span>
                  </div>
                </label>
              </div>
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

            <div className='pt-4'>
              <button
                type='submit'
                disabled={loading}
                className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Signing in...
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
                        d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                      />
                    </svg>
                    Sign in to continue
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
