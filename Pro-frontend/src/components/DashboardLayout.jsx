import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const DashboardLayout = ({ children, title }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token || !userRole) {
      navigate('/login');
      return;
    }

    setUser({ role: userRole });

    // Show welcome message
    setTimeout(() => {
      enqueueSnackbar(`Welcome to your ${userRole} dashboard!`, {
        variant: 'info',
        autoHideDuration: 3000,
      });
    }, 500);
  }, [navigate, enqueueSnackbar]);

  const handleLogout = () => {
    enqueueSnackbar('Logged out successfully', {
      variant: 'success',
      autoHideDuration: 2000,
    });

    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');

    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  if (!user) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <header className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <h1 className='text-2xl font-bold text-gray-900'>SkillBridge</h1>
              <span className='ml-4 px-3 py-1 text-sm bg-indigo-100 text-indigo-800 rounded-full'>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}{' '}
                Dashboard
              </span>
            </div>

            <div className='flex items-center space-x-4'>
              <span className='text-sm text-gray-700'>
                Welcome, {user.role}!
              </span>
              <button
                onClick={handleLogout}
                className='px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8'>
        {title && (
          <div className='mb-6'>
            <h2 className='text-3xl font-bold text-gray-900'>{title}</h2>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
