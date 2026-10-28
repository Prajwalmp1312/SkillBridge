import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
      const response = await axios.post(
        'http://localhost:5000/api/v1/admin/signin',
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('userId', response.data.admin.id);
        localStorage.setItem(
          'adminData',
          JSON.stringify(response.data.admin)
        );

        enqueueSnackbar('Admin login successful! Redirecting...', {
          variant: 'success',
          autoHideDuration: 2000,
        });

        setTimeout(() => {
          navigate('/admin-dashboard');
        }, 1000);
      }
    } catch (error) {
      console.error('Admin login error:', error);
      const errorMessage =
        error.response?.data?.message ||
        'Admin login failed. Please try again.';
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-yellow-500/10'></div>

      <div className='relative max-w-md w-full space-y-8'>
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

          <div className='mx-auto w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl'>
            <svg
              className='w-8 h-8 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
              />
            </svg>
          </div>

          <h2 className='text-4xl font-bold text-white mb-2'>Admin Portal</h2>
          <p className='text-gray-300 text-lg'>Secure administrative access</p>
        </div>

        {/* Form */}
        <div className='bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20'>
          <form
            className='space-y-6'
            onSubmit={handleSubmit}
          >
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-200 mb-2'
              >
                Email Address
              </label>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='relative block w-full px-4 py-3 border border-gray-300/30 rounded-2xl placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm transition-all duration-200'
                placeholder='admin@skillbridge.com'
                value={formData.email}
                onChange={handleChange}
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
                autoComplete='current-password'
                required
                className='relative block w-full px-4 py-3 border border-gray-300/30 rounded-2xl placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm transition-all duration-200'
                placeholder='Enter your admin password'
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <button
                type='submit'
                disabled={loading}
                className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in to Admin Panel'
                )}
              </button>
            </div>
          </form>

          {/* Admin Signup Link */}
          <div className='mt-6 text-center'>
            <p className='text-gray-300 text-sm'>
              Need admin access?{' '}
              <button
                onClick={() => navigate('/admin-signup')}
                className='font-medium text-red-400 hover:text-red-300 transition-colors'
              >
                Create Admin Account
              </button>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className='bg-red-500/10 border border-red-500/20 rounded-2xl p-4'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-red-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <h3 className='text-sm font-medium text-red-200'>
                Restricted Access
              </h3>
              <p className='mt-1 text-sm text-red-300'>
                This portal is restricted to authorized administrators only. All
                access attempts are logged and monitored.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
