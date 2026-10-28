import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const AdminSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecretKey: '',
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

    // Client-side validation
    if (!formData.adminSecretKey.trim()) {
      enqueueSnackbar('Admin secret key is required', {
        variant: 'error',
        autoHideDuration: 5000,
      });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      enqueueSnackbar('Passwords do not match', {
        variant: 'error',
        autoHideDuration: 5000,
      });
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      enqueueSnackbar('Password must be at least 8 characters long', {
        variant: 'error',
        autoHideDuration: 5000,
      });
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/v1/admin/signup',
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          adminSecretKey: formData.adminSecretKey,
        }
      );

      if (response.data.success) {
        // Check if token exists in the response
        const token = response.data.data?.token || response.data.token;
        const admin = response.data.data?.admin || response.data.admin;

        if (token) {
          localStorage.setItem('token', token);
          localStorage.setItem('userRole', 'admin');
          localStorage.setItem('userId', admin?.id || admin?._id);
          localStorage.setItem('adminData', JSON.stringify(admin));

          enqueueSnackbar(
            'Admin account created successfully! Redirecting...',
            {
              variant: 'success',
              autoHideDuration: 2000,
            }
          );

          setTimeout(() => {
            navigate('/admin-dashboard');
          }, 2000);
        } else {
          enqueueSnackbar(
            'Account created but login failed. Please try logging in manually.',
            {
              variant: 'warning',
              autoHideDuration: 5000,
            }
          );
          setTimeout(() => {
            navigate('/admin-login');
          }, 2000);
        }
      } else {
        enqueueSnackbar(response.data.message || 'Account creation failed', {
          variant: 'error',
          autoHideDuration: 5000,
        });
      }
    } catch (error) {
      console.error('Admin signup error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Network error. Please try again.';
      enqueueSnackbar(errorMessage, {
        variant: 'error',
        autoHideDuration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8'>
      {/* Background Pattern */}
      <div className='absolute inset-0 bg-gradient-to-br from-red-500/10 via-orange-500/5 to-yellow-500/10'></div>

      <div className='relative max-w-4xl w-full space-y-4'>
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

          <div className='mx-auto w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl'>
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
            Create Admin Account
          </h2>
          <p className='text-gray-300'>Set up your administrative access</p>
          <div className='mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl'>
            <p className='text-red-300 text-sm text-center'>
              🔒 <strong>Restricted Access:</strong> Admin secret key required
              for account creation
            </p>
          </div>
        </div>

        {/* Form */}
        <div className='bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20'>
          <form
            className='space-y-4'
            onSubmit={handleSubmit}
          >
            {/* Two Column Layout */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Left Column */}
              <div className='space-y-4'>
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
                    autoComplete='name'
                    required
                    className='relative block w-full px-4 py-3 border border-gray-300/30 rounded-2xl placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm transition-all duration-200'
                    placeholder='Enter your full name'
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

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
                    htmlFor='adminSecretKey'
                    className='block text-sm font-medium text-gray-200 mb-2'
                  >
                    Admin Secret Key
                  </label>
                  <input
                    id='adminSecretKey'
                    name='adminSecretKey'
                    type='password'
                    required
                    className='relative block w-full px-4 py-3 border border-gray-300/30 rounded-2xl placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm transition-all duration-200'
                    placeholder='Enter admin secret key'
                    value={formData.adminSecretKey}
                    onChange={handleChange}
                  />
                  <p className='mt-1 text-xs text-yellow-400'>
                    ⚠️ Required authorization key
                  </p>
                </div>
              </div>

              {/* Right Column */}
              <div className='space-y-4'>
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
                    autoComplete='new-password'
                    required
                    className='relative block w-full px-4 py-3 border border-gray-300/30 rounded-2xl placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm transition-all duration-200'
                    placeholder='Create a strong password'
                    value={formData.password}
                    onChange={handleChange}
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
                    autoComplete='new-password'
                    required
                    className='relative block w-full px-4 py-3 border border-gray-300/30 rounded-2xl placeholder-gray-400 text-white bg-white/10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm transition-all duration-200'
                    placeholder='Confirm your password'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>

                <div className='mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl'>
                  <div className='text-xs text-red-300 space-y-1'>
                    <p>• Password must be 8+ characters</p>
                    <p>• Use numbers and special characters</p>
                    <p>• Keep credentials secure</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button - Full Width */}
            <div className='mt-6'>
              <button
                type='submit'
                disabled={loading}
                className='group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Admin Account'
                )}
              </button>
            </div>
          </form>

          {/* Admin Login Link */}
          <div className='mt-6 text-center'>
            <p className='text-gray-300 text-sm'>
              Already have admin access?{' '}
              <button
                onClick={() => navigate('/admin-login')}
                className='font-medium text-red-400 hover:text-red-300 transition-colors'
              >
                Sign in here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;
