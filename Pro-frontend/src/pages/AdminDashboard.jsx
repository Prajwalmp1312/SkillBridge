import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const AdminDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 0,
    totalTutors: 0,
    totalCourses: 0,
    publishedCourses: 0,
    unpublishedCourses: 0,
  });
  const [students, setStudents] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Helper function to safely format dates
  const formatDate = (dateString, objectId = null) => {
    if (!dateString && !objectId) return 'N/A';

    try {
      // First try to use the provided date
      if (dateString) {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString();
        }
      }

      // Fallback: Extract date from MongoDB ObjectId if available
      if (objectId) {
        try {
          const timestamp = parseInt(objectId.substring(0, 8), 16) * 1000;
          const objectIdDate = new Date(timestamp);
          if (!isNaN(objectIdDate.getTime())) {
            return objectIdDate.toLocaleDateString() + ' (approx)';
          }
        } catch (idError) {
          console.log('Error extracting date from ObjectId:', idError);
        }
      }

      return 'Unknown Date';
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  // Check if user is admin
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');

    if (!token || userRole !== 'admin') {
      enqueueSnackbar('Access denied. Admin privileges required.', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      navigate('/admin-login');
      return;
    }

    fetchDashboardData();
  }, [navigate, enqueueSnackbar]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token);
      console.log(
        'Token preview:',
        token ? token.substring(0, 20) + '...' : 'No token'
      );

      if (!token) {
        enqueueSnackbar('No authentication token found. Please login again.', {
          variant: 'error',
          autoHideDuration: 3000,
        });
        navigate('/admin-login');
        return;
      }

      // Test basic connectivity first
      console.log('Testing backend connectivity...');
      try {
        const healthCheck = await axios.get('http://localhost:5000/api/health');
        console.log('Backend health check:', healthCheck.data);
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        enqueueSnackbar(
          'Backend server is not responding. Please check if it is running on port 5000.',
          {
            variant: 'error',
            autoHideDuration: 5000,
          }
        );
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      };

      // Fetch dashboard stats
      console.log('Fetching dashboard stats...');
      const timestamp = Date.now();
      const statsResponse = await axios.get(
        `http://localhost:5000/api/v1/admin/dashboard/stats?t=${timestamp}`,
        config
      );
      console.log('Stats response:', statsResponse.data);

      if (statsResponse.data.success) {
        setDashboardStats(statsResponse.data.stats);
        console.log('Dashboard stats set:', statsResponse.data.stats);
      }

      // Fetch students
      console.log('Fetching students...');
      const studentsResponse = await axios.get(
        `http://localhost:5000/api/v1/admin/students?limit=5&t=${timestamp}`,
        config
      );
      console.log('Students response:', studentsResponse.data);

      if (studentsResponse.data.success) {
        setStudents(studentsResponse.data.students);
        console.log('Students set:', studentsResponse.data.students);
        // Debug: Check the structure of student data
        if (studentsResponse.data.students.length > 0) {
          console.log(
            'First student structure:',
            studentsResponse.data.students[0]
          );
        }
      } else {
        console.log('Students fetch failed:', studentsResponse.data);
      }

      // Fetch tutors
      console.log('Fetching tutors...');
      const tutorsResponse = await axios.get(
        `http://localhost:5000/api/v1/admin/tutors?limit=5&t=${timestamp}`,
        config
      );
      console.log('Tutors response:', tutorsResponse.data);

      if (tutorsResponse.data.success) {
        setTutors(tutorsResponse.data.tutors);
        console.log('Tutors set:', tutorsResponse.data.tutors);
        // Debug: Check the structure of tutor data
        if (tutorsResponse.data.tutors.length > 0) {
          console.log('First tutor structure:', tutorsResponse.data.tutors[0]);
        }
      } else {
        console.log('Tutors fetch failed:', tutorsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);

      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('Authentication failed - redirecting to login');
        enqueueSnackbar('Session expired. Please login again.', {
          variant: 'error',
          autoHideDuration: 3000,
        });
        localStorage.clear();
        navigate('/admin-login');
      } else if (
        error.code === 'ECONNREFUSED' ||
        error.message.includes('Network Error')
      ) {
        console.error('Backend server not reachable');
        enqueueSnackbar(
          'Cannot connect to server. Please check if backend is running.',
          {
            variant: 'error',
            autoHideDuration: 5000,
          }
        );
      } else {
        console.error('Unknown error occurred');
        enqueueSnackbar(
          `Error loading dashboard data: ${
            error.response?.data?.message || error.message
          }`,
          {
            variant: 'error',
            autoHideDuration: 5000,
          }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    enqueueSnackbar('Logged out successfully', {
      variant: 'success',
      autoHideDuration: 2000,
    });
    navigate('/');
  };

  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
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
              <div className='w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center mr-3'>
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
                    d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                  />
                </svg>
              </div>
              <h1 className='text-2xl font-bold text-gray-900'>
                Admin Dashboard
              </h1>
            </div>
            <div className='flex items-center space-x-4'>
              <span className='text-gray-700'>Welcome, {adminData.name}</span>
              <button
                onClick={handleLogout}
                className='bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Tabs */}
        <div className='mb-8'>
          <nav className='flex space-x-8'>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'students'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab('tutors')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tutors'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tutors
            </button>
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8'>
              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                        <svg
                          className='w-4 h-4 text-white'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                        </svg>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          Total Students
                        </dt>
                        <dd className='text-lg font-medium text-gray-900'>
                          {dashboardStats.totalStudents}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                        <svg
                          className='w-4 h-4 text-white'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path d='M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z' />
                        </svg>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          Total Tutors
                        </dt>
                        <dd className='text-lg font-medium text-gray-900'>
                          {dashboardStats.totalTutors}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center'>
                        <svg
                          className='w-4 h-4 text-white'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path d='M2 6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z' />
                        </svg>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          Total Courses
                        </dt>
                        <dd className='text-lg font-medium text-gray-900'>
                          {dashboardStats.totalCourses}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-8 h-8 bg-green-600 rounded-full flex items-center justify-center'>
                        <svg
                          className='w-4 h-4 text-white'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          Published
                        </dt>
                        <dd className='text-lg font-medium text-gray-900'>
                          {dashboardStats.publishedCourses}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white overflow-hidden shadow rounded-lg'>
                <div className='p-5'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center'>
                        <svg
                          className='w-4 h-4 text-white'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                    </div>
                    <div className='ml-5 w-0 flex-1'>
                      <dl>
                        <dt className='text-sm font-medium text-gray-500 truncate'>
                          Unpublished
                        </dt>
                        <dd className='text-lg font-medium text-gray-900'>
                          {dashboardStats.unpublishedCourses}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
              {/* Recent Students */}
              <div className='bg-white shadow rounded-lg'>
                <div className='px-4 py-5 sm:p-6'>
                  <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                    Recent Students
                  </h3>
                  <div className='space-y-3'>
                    {students.slice(0, 5).map((student) => (
                      <div
                        key={student._id}
                        className='flex items-center justify-between'
                      >
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {student.name}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {student.email}
                          </p>
                        </div>
                        <span className='text-xs text-gray-400'>
                          {formatDate(student.createdAt, student._id)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Tutors */}
              <div className='bg-white shadow rounded-lg'>
                <div className='px-4 py-5 sm:p-6'>
                  <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                    Recent Tutors
                  </h3>
                  <div className='space-y-3'>
                    {tutors.slice(0, 5).map((tutor) => (
                      <div
                        key={tutor._id}
                        className='flex items-center justify-between'
                      >
                        <div>
                          <p className='text-sm font-medium text-gray-900'>
                            {tutor.name}
                          </p>
                          <p className='text-sm text-gray-500'>{tutor.email}</p>
                        </div>
                        <span className='text-xs text-gray-400'>
                          {formatDate(tutor.createdAt, tutor._id)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className='bg-white shadow rounded-lg'>
            <div className='px-4 py-5 sm:p-6'>
              <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                All Students
              </h3>
              <div className='overflow-hidden'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Name
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Email
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {students.map((student) => (
                      <tr key={student._id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {student.name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {student.email}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {formatDate(student.createdAt, student._id)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tutors Tab */}
        {activeTab === 'tutors' && (
          <div className='bg-white shadow rounded-lg'>
            <div className='px-4 py-5 sm:p-6'>
              <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                All Tutors
              </h3>
              <div className='overflow-hidden'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Name
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Email
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {tutors.map((tutor) => (
                      <tr key={tutor._id}>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {tutor.name}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {tutor.email}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {formatDate(tutor.createdAt, tutor._id)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
