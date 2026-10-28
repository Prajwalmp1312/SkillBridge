import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

const StudentDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      enrolledCourses: 0,
      completedCourses: 0,
      inProgressCourses: 0,
      totalWatchTime: 0,
      averageProgress: 0,
      certificatesEarned: 0,
    },
    recentCourses: [],
    recentActivity: [],
  });
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Check if user is student
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');

    if (!token || userRole !== 'student') {
      enqueueSnackbar('Access denied. Student privileges required.', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      navigate('/student-login');
      return;
    }

    fetchDashboardData();
  }, [navigate, enqueueSnackbar]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token ? 'Present' : 'Missing');

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      };

      // Test health endpoint first
      try {
        const healthResponse = await axios.get(
          'http://localhost:5000/api/v1/student/health'
        );
        console.log('Health check passed:', healthResponse.data);
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        throw new Error('Backend server not reachable');
      }

      // Test auth endpoint
      try {
        const authResponse = await axios.get(
          'http://localhost:5000/api/v1/student/test-auth',
          config
        );
        console.log('Auth test passed:', authResponse.data);
      } catch (authError) {
        console.error('Auth test failed:', authError);
        if (authError.response?.status === 401) {
          throw new Error('Authentication failed - please login again');
        }
        throw authError;
      }

      // Fetch student dashboard stats
      const statsResponse = await axios.get(
        'http://localhost:5000/api/v1/student/dashboard',
        config
      );

      if (statsResponse.data.success) {
        setDashboardData((prev) => ({
          ...prev,
          stats: {
            enrolledCourses: statsResponse.data.data.totalCourses || 0,
            completedCourses: statsResponse.data.data.completedCourses || 0,
            inProgressCourses: statsResponse.data.data.inProgressCourses || 0,
            totalWatchTime: statsResponse.data.data.totalHours || 0,
            averageProgress:
              statsResponse.data.data.totalCourses > 0
                ? Math.round(
                    (statsResponse.data.data.completedCourses /
                      statsResponse.data.data.totalCourses) *
                      100
                  )
                : 0,
            certificatesEarned: statsResponse.data.data.completedCourses || 0,
          },
          recentCourses: statsResponse.data.data.recentCourses || [],
        }));
      }

      // Fetch enrolled courses
      const enrolledResponse = await axios.get(
        'http://localhost:5000/api/v1/student/enrolled-courses',
        config
      );

      if (enrolledResponse.data.success) {
        setEnrolledCourses(enrolledResponse.data.data.courses || []);
        setDashboardData((prev) => ({
          ...prev,
          recentCourses: (enrolledResponse.data.data.courses || []).slice(0, 3),
        }));
      }

      // Fetch available courses for browsing
      const availableResponse = await axios.get(
        'http://localhost:5000/api/v1/student/courses',
        config
      );

      if (availableResponse.data.success) {
        setAvailableCourses(availableResponse.data.data.courses || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);

      if (error.response?.status === 401 || error.response?.status === 403) {
        enqueueSnackbar('Session expired. Please login again.', {
          variant: 'error',
          autoHideDuration: 3000,
        });
        localStorage.clear();
        navigate('/student-login');
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Error loading dashboard data';
        enqueueSnackbar(errorMessage, {
          variant: 'error',
          autoHideDuration: 5000,
        });
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

  // Course enrollment
  const handleEnrollCourse = async (courseId) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.post(
        `http://localhost:5000/api/v1/student/enroll/${courseId}`,
        {},
        config
      );

      if (response.data.success) {
        enqueueSnackbar('Successfully enrolled in course!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error enrolling in course',
        {
          variant: 'error',
          autoHideDuration: 5000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to course player
  const navigateToCourse = (courseId) => {
    navigate(`/course/${courseId}`);
  };

  // Filter available courses
  const filteredCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !categoryFilter || course.category === categoryFilter;
    const matchesLevel = !levelFilter || course.level === levelFilter;

    return matchesSearch && matchesCategory && matchesLevel;
  });

  // Get unique categories and levels for filters
  const categories = [
    ...new Set(availableCourses.map((course) => course.category)),
  ];
  const levels = [...new Set(availableCourses.map((course) => course.level))];

  const studentData = JSON.parse(localStorage.getItem('studentData') || '{}');

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      {/* Header */}
      <header className='shadow-sm border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/90'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <div className='w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg'>
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
                    d='M12 14l9-5-9-5-9 5 9 5z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
                  />
                </svg>
              </div>
              <div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                  Student Dashboard
                </h1>
                <p className='text-sm text-gray-500'>
                  Track your learning journey
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='hidden md:flex items-center space-x-2'>
                <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                  <span className='text-blue-600 font-semibold text-sm'>
                    {studentData.name?.charAt(0).toUpperCase() || 'S'}
                  </span>
                </div>
                <span className='text-gray-700 font-medium'>
                  Welcome, {studentData.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Tabs Navigation */}
        <div className='mb-8'>
          <nav className='flex space-x-8 bg-white rounded-2xl p-2 shadow-sm border border-gray-100'>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'my-courses', label: 'My Courses', icon: '📚' },
              { id: 'browse-courses', label: 'Browse Courses', icon: '🔍' },
              { id: 'progress', label: 'Progress', icon: '📈' },
              { id: 'certificates', label: 'Certificates', icon: '🏆' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className='space-y-8'>
            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Enrolled Courses
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {dashboardData.stats.enrolledCourses}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
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
                        d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Completed Courses
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {dashboardData.stats.completedCourses}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center'>
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
                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      In Progress
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {dashboardData.stats.inProgressCourses}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center'>
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
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Certificates Earned
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {dashboardData.stats.certificatesEarned}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center'>
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
                        d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Courses */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-semibold text-gray-900'>
                  Continue Learning
                </h3>
                <button
                  onClick={() => setActiveTab('my-courses')}
                  className='text-blue-600 hover:text-blue-700 font-medium text-sm'
                >
                  View All Courses →
                </button>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {enrolledCourses.slice(0, 3).map((course) => (
                  <div
                    key={course._id}
                    className='border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer'
                    onClick={() => navigateToCourse(course._id)}
                  >
                    <div className='h-32 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mb-4 flex items-center justify-center'>
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className='w-full h-full object-cover rounded-lg'
                        />
                      ) : (
                        <svg
                          className='w-12 h-12 text-white opacity-50'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1}
                            d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                          />
                        </svg>
                      )}
                    </div>

                    <h4 className='font-semibold text-gray-900 mb-2 line-clamp-2'>
                      {course.title}
                    </h4>
                    <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                      {course.description}
                    </p>

                    {/* Progress Bar */}
                    <div className='mb-3'>
                      <div className='flex items-center justify-between text-sm mb-1'>
                        <span className='text-gray-600'>Progress</span>
                        <span className='font-medium'>
                          {course.progress || 0}%
                        </span>
                      </div>
                      <div className='w-full bg-gray-200 rounded-full h-2'>
                        <div
                          className='bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300'
                          style={{ width: `${course.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className='flex items-center justify-between text-sm text-gray-500'>
                      <span>
                        {course.completedLessons || 0} /{' '}
                        {course.totalLessons || 0} lessons
                      </span>
                      <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'>
                        {course.level}
                      </span>
                    </div>
                  </div>
                ))}

                {enrolledCourses.length === 0 && (
                  <div className='col-span-full text-center py-12'>
                    <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                      <svg
                        className='w-12 h-12 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={1}
                          d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                        />
                      </svg>
                    </div>
                    <h4 className='text-xl font-semibold text-gray-900 mb-2'>
                      No courses yet
                    </h4>
                    <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                      Start your learning journey by browsing our available
                      courses and enrolling in ones that interest you.
                    </p>
                    <button
                      onClick={() => setActiveTab('browse-courses')}
                      className='bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    >
                      Browse Courses
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Learning Progress Overview */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Learning Progress
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>Overall Progress</span>
                    <span className='font-semibold'>
                      {dashboardData.stats.averageProgress}%
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-3'>
                    <div
                      className='bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500'
                      style={{
                        width: `${dashboardData.stats.averageProgress}%`,
                      }}
                    ></div>
                  </div>

                  <div className='pt-4 space-y-3'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-600'>Total Watch Time</span>
                      <span className='font-medium'>
                        {dashboardData.stats.totalWatchTime} hours
                      </span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-600'>Average Session</span>
                      <span className='font-medium'>25 minutes</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-gray-600'>This Week</span>
                      <span className='font-medium'>3.5 hours</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Quick Actions
                </h3>
                <div className='space-y-3'>
                  <button
                    onClick={() => setActiveTab('browse-courses')}
                    className='w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-4 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                      />
                    </svg>
                    <span>Browse New Courses</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('progress')}
                    className='w-full bg-white border-2 border-blue-500 text-blue-600 hover:bg-blue-50 p-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                      />
                    </svg>
                    <span>View Detailed Progress</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('certificates')}
                    className='w-full bg-white border-2 border-purple-500 text-purple-600 hover:bg-purple-50 p-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2'
                  >
                    <svg
                      className='w-5 h-5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
                      />
                    </svg>
                    <span>View Certificates</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* My Courses Tab */}
        {activeTab === 'my-courses' && (
          <div className='space-y-6'>
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    My Courses
                  </h3>
                  <p className='text-gray-600 mt-1'>
                    Continue your learning journey
                  </p>
                </div>
                <div className='flex items-center space-x-3'>
                  <select className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                    <option value=''>All Courses</option>
                    <option value='in-progress'>In Progress</option>
                    <option value='completed'>Completed</option>
                    <option value='not-started'>Not Started</option>
                  </select>
                </div>
              </div>

              {/* Course Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {enrolledCourses.map((course) => (
                  <div
                    key={course._id}
                    className='bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'
                  >
                    <div className='h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative'>
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <div className='w-full h-full flex items-center justify-center'>
                          <svg
                            className='w-16 h-16 text-white opacity-50'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={1}
                              d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                            />
                          </svg>
                        </div>
                      )}
                      <div className='absolute top-4 right-4'>
                        <span className='px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700'>
                          {course.progress || 0}% Complete
                        </span>
                      </div>
                    </div>

                    <div className='p-6'>
                      <h4 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
                        {course.title}
                      </h4>
                      <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                        {course.description}
                      </p>

                      {/* Progress Bar */}
                      <div className='mb-4'>
                        <div className='flex items-center justify-between text-sm mb-2'>
                          <span className='text-gray-600'>Progress</span>
                          <span className='font-medium'>
                            {course.progress || 0}%
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300'
                            style={{ width: `${course.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Course Info */}
                      <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                        <span>
                          {course.completedLessons || 0} /{' '}
                          {course.totalLessons || 0} lessons
                        </span>
                        <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs'>
                          {course.level}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => navigateToCourse(course._id)}
                          className='flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200'
                        >
                          Continue Learning
                        </button>
                        <button className='p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'>
                          <svg
                            className='w-4 h-4 text-gray-600'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {enrolledCourses.length === 0 && (
                  <div className='col-span-full text-center py-12'>
                    <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                      <svg
                        className='w-12 h-12 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={1}
                          d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                        />
                      </svg>
                    </div>
                    <h4 className='text-xl font-semibold text-gray-900 mb-2'>
                      No enrolled courses
                    </h4>
                    <p className='text-gray-600 mb-6'>
                      Start learning by browsing our course catalog
                    </p>
                    <button
                      onClick={() => setActiveTab('browse-courses')}
                      className='bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200'
                    >
                      Browse Courses
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Browse Courses Tab */}
        {activeTab === 'browse-courses' && (
          <div className='space-y-6'>
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    Browse Courses
                  </h3>
                  <p className='text-gray-600 mt-1'>
                    Discover new skills and expand your knowledge
                  </p>
                </div>
              </div>

              {/* Search and Filters */}
              <div className='flex flex-wrap items-center gap-4 mb-6'>
                <div className='flex-1 min-w-64'>
                  <div className='relative'>
                    <input
                      type='text'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder='Search courses...'
                      className='w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                    />
                    <svg
                      className='w-5 h-5 text-gray-400 absolute left-3 top-3.5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                      />
                    </svg>
                  </div>
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className='border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>All Categories</option>
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className='border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                  <option value=''>All Levels</option>
                  {levels.map((level) => (
                    <option
                      key={level}
                      value={level}
                    >
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Course Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {filteredCourses.map((course) => (
                <div
                  key={course._id}
                  className='bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'
                >
                  <div className='h-48 bg-gradient-to-br from-blue-500 to-indigo-600 relative'>
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <svg
                          className='w-16 h-16 text-white opacity-50'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={1}
                            d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                          />
                        </svg>
                      </div>
                    )}
                    <div className='absolute top-4 left-4'>
                      <span className='px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-medium'>
                        {course.category}
                      </span>
                    </div>
                  </div>

                  <div className='p-6'>
                    <div className='flex items-start justify-between mb-3'>
                      <h4 className='text-lg font-semibold text-gray-900 line-clamp-2 flex-1'>
                        {course.title}
                      </h4>
                      <div className='ml-2'>
                        <span className='text-2xl font-bold text-blue-600'>
                          ₹{course.price}
                        </span>
                      </div>
                    </div>

                    <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                      {course.description}
                    </p>

                    <div className='flex items-center space-x-4 text-sm text-gray-500 mb-4'>
                      <span className='flex items-center space-x-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        <span>{course.duration} hours</span>
                      </span>
                      <span className='flex items-center space-x-1'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                          />
                        </svg>
                        <span>{course.enrollmentCount || 0} students</span>
                      </span>
                    </div>

                    <div className='flex items-center justify-between mb-4'>
                      <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium'>
                        {course.level}
                      </span>
                      <div className='flex items-center space-x-1'>
                        <svg
                          className='w-4 h-4 text-yellow-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z' />
                        </svg>
                        <span className='text-sm text-gray-600'>4.8</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleEnrollCourse(course._id)}
                      disabled={isLoading}
                      className='w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {isLoading ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                  </div>
                </div>
              ))}

              {filteredCourses.length === 0 && (
                <div className='col-span-full text-center py-12'>
                  <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg
                      className='w-12 h-12 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1}
                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                      />
                    </svg>
                  </div>
                  <h4 className='text-xl font-semibold text-gray-900 mb-2'>
                    No courses found
                  </h4>
                  <p className='text-gray-600 mb-6'>
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress Tab */}
        {activeTab === 'progress' && (
          <div className='space-y-6'>
            {/* Progress Overview */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    Learning Progress
                  </h3>
                  <p className='text-gray-600 mt-1'>
                    Track your learning journey and achievements
                  </p>
                </div>
                <div className='flex items-center space-x-3'>
                  <select className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                    <option value='all'>All Time</option>
                    <option value='week'>This Week</option>
                    <option value='month'>This Month</option>
                    <option value='quarter'>This Quarter</option>
                  </select>
                </div>
              </div>

              {/* Progress Stats Grid */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-blue-600 text-sm font-medium'>
                        Total Study Time
                      </p>
                      <p className='text-2xl font-bold text-blue-900 mt-1'>
                        {dashboardData.stats.totalWatchTime}h
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center'>
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
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-sm'>
                    <span className='text-green-600'>+12% </span>
                    <span className='text-gray-600 ml-1'>from last week</span>
                  </div>
                </div>

                <div className='bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-green-600 text-sm font-medium'>
                        Completion Rate
                      </p>
                      <p className='text-2xl font-bold text-green-900 mt-1'>
                        {dashboardData.stats.averageProgress}%
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center'>
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
                          d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-sm'>
                    <span className='text-green-600'>+5% </span>
                    <span className='text-gray-600 ml-1'>from last month</span>
                  </div>
                </div>

                <div className='bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-purple-600 text-sm font-medium'>
                        Learning Streak
                      </p>
                      <p className='text-2xl font-bold text-purple-900 mt-1'>
                        7 days
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center'>
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
                          d='M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z'
                        />
                      </svg>
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-sm'>
                    <span className='text-purple-600'>Keep going! </span>
                    <span className='text-gray-600 ml-1'>Personal best</span>
                  </div>
                </div>

                <div className='bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-6 border border-orange-100'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-orange-600 text-sm font-medium'>
                        Skills Gained
                      </p>
                      <p className='text-2xl font-bold text-orange-900 mt-1'>
                        {dashboardData.stats.completedCourses * 3}
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center'>
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
                          d='M13 10V3L4 14h7v7l9-11h-7z'
                        />
                      </svg>
                    </div>
                  </div>
                  <div className='mt-4 flex items-center text-sm'>
                    <span className='text-orange-600'>
                      +{dashboardData.stats.inProgressCourses * 2}{' '}
                    </span>
                    <span className='text-gray-600 ml-1'>in progress</span>
                  </div>
                </div>
              </div>

              {/* Weekly Progress Chart */}
              <div className='bg-gray-50 rounded-xl p-6 mb-8'>
                <h4 className='text-lg font-semibold text-gray-900 mb-4'>
                  Weekly Study Activity
                </h4>
                <div className='flex items-end space-x-2 h-40'>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                    (day, index) => {
                      const height = Math.random() * 80 + 20; // Mock data
                      return (
                        <div
                          key={day}
                          className='flex-1 flex flex-col items-center'
                        >
                          <div
                            className='w-full bg-gradient-to-t from-blue-500 to-indigo-600 rounded-t-lg transition-all duration-300 hover:from-blue-600 hover:to-indigo-700'
                            style={{ height: `${height}%` }}
                          ></div>
                          <span className='text-xs text-gray-600 mt-2 font-medium'>
                            {day}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
                <div className='flex justify-between text-xs text-gray-500 mt-2'>
                  <span>0h</span>
                  <span>2h</span>
                  <span>4h</span>
                </div>
              </div>
            </div>

            {/* Course Progress Details */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <h4 className='text-xl font-semibold text-gray-900 mb-6'>
                Course Progress Details
              </h4>

              <div className='space-y-6'>
                {enrolledCourses.length > 0 ? (
                  enrolledCourses.map((course) => (
                    <div
                      key={course._id}
                      className='border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-start justify-between mb-4'>
                        <div className='flex-1'>
                          <h5 className='text-lg font-semibold text-gray-900 mb-2'>
                            {course.title}
                          </h5>
                          <p className='text-gray-600 text-sm mb-3'>
                            {course.description}
                          </p>
                          <div className='flex items-center space-x-4 text-sm text-gray-500'>
                            <span className='flex items-center space-x-1'>
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                />
                              </svg>
                              <span>{course.duration || 0} hours</span>
                            </span>
                            <span className='flex items-center space-x-1'>
                              <svg
                                className='w-4 h-4'
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
                              <span>{course.totalLessons || 0} lessons</span>
                            </span>
                            <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium'>
                              {course.level || 'Beginner'}
                            </span>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-2xl font-bold text-gray-900 mb-1'>
                            {course.progress || 0}%
                          </div>
                          <div className='text-sm text-gray-500'>
                            {course.completedLessons || 0} /{' '}
                            {course.totalLessons || 0} completed
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className='mb-4'>
                        <div className='flex items-center justify-between text-sm mb-2'>
                          <span className='text-gray-600'>Progress</span>
                          <span className='font-medium'>
                            {course.progress || 0}%
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-3'>
                          <div
                            className='bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500'
                            style={{ width: `${course.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <button
                            onClick={() => navigateToCourse(course._id)}
                            className='bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200'
                          >
                            Continue Learning
                          </button>
                          <button className='border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors'>
                            View Details
                          </button>
                        </div>
                        <div className='text-sm text-gray-500'>
                          Last studied: {new Date().toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='text-center py-12'>
                    <div className='w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                      <svg
                        className='w-12 h-12 text-gray-400'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={1}
                          d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                        />
                      </svg>
                    </div>
                    <h4 className='text-xl font-semibold text-gray-900 mb-2'>
                      No progress to track yet
                    </h4>
                    <p className='text-gray-600 mb-6'>
                      Start learning to see your progress analytics
                    </p>
                    <button
                      onClick={() => setActiveTab('browse-courses')}
                      className='bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200'
                    >
                      Browse Courses
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certificates Tab */}
        {activeTab === 'certificates' && (
          <div className='space-y-6'>
            {/* Certificates Overview */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    My Certificates
                  </h3>
                  <p className='text-gray-600 mt-1'>
                    Your achievements and certifications
                  </p>
                </div>
                <div className='flex items-center space-x-3'>
                  <button className='bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200'>
                    Download All
                  </button>
                  <select className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                    <option value='all'>All Categories</option>
                    <option value='web-development'>Web Development</option>
                    <option value='data-science'>Data Science</option>
                    <option value='design'>Design</option>
                    <option value='business'>Business</option>
                  </select>
                </div>
              </div>

              {/* Certificate Stats */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                <div className='bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-emerald-600 text-sm font-medium'>
                        Certificates Earned
                      </p>
                      <p className='text-2xl font-bold text-emerald-900 mt-1'>
                        {dashboardData.stats.certificatesEarned}
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center'>
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
                          d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-100'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-yellow-600 text-sm font-medium'>
                        Verified Skills
                      </p>
                      <p className='text-2xl font-bold text-yellow-900 mt-1'>
                        {dashboardData.stats.certificatesEarned * 3}
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center'>
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
                          d='M13 10V3L4 14h7v7l9-11h-7z'
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-6 border border-purple-100'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-purple-600 text-sm font-medium'>
                        Learning Hours
                      </p>
                      <p className='text-2xl font-bold text-purple-900 mt-1'>
                        {dashboardData.stats.totalWatchTime}h
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center'>
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
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-blue-600 text-sm font-medium'>
                        In Progress
                      </p>
                      <p className='text-2xl font-bold text-blue-900 mt-1'>
                        {dashboardData.stats.inProgressCourses}
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center'>
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
                          d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificates Gallery */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <h4 className='text-xl font-semibold text-gray-900 mb-6'>
                Certificate Gallery
              </h4>

              {dashboardData.stats.certificatesEarned > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {/* Mock certificates - in real app, this would come from API */}
                  {Array.from(
                    {
                      length: Math.max(
                        1,
                        dashboardData.stats.certificatesEarned
                      ),
                    },
                    (_, index) => (
                      <div
                        key={index}
                        className='group relative bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg'
                      >
                        <div className='p-6'>
                          {/* Certificate Header */}
                          <div className='flex items-center justify-between mb-4'>
                            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center'>
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
                                  d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
                                />
                              </svg>
                            </div>
                            <span className='px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium'>
                              Verified
                            </span>
                          </div>

                          {/* Certificate Content */}
                          <div className='mb-4'>
                            <h5 className='text-lg font-semibold text-gray-900 mb-2'>
                              {index === 0
                                ? 'React Development Fundamentals'
                                : index === 1
                                ? 'Advanced JavaScript Concepts'
                                : index === 2
                                ? 'Modern Web Design Principles'
                                : `Course Certificate ${index + 1}`}
                            </h5>
                            <p className='text-gray-600 text-sm mb-3'>
                              {index === 0
                                ? 'Completed comprehensive React.js course with hands-on projects'
                                : index === 1
                                ? 'Mastered advanced JavaScript concepts and ES6+ features'
                                : index === 2
                                ? 'Expert-level web design and user experience principles'
                                : 'Successfully completed advanced programming course'}
                            </p>
                            <div className='flex items-center space-x-4 text-sm text-gray-500'>
                              <span className='flex items-center space-x-1'>
                                <svg
                                  className='w-4 h-4'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M8 7V3a4 4 0 118 0v4'
                                  />
                                </svg>
                                <span>
                                  Issued:{' '}
                                  {new Date(
                                    Date.now() -
                                      index * 30 * 24 * 60 * 60 * 1000
                                  ).toLocaleDateString()}
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* Certificate Skills */}
                          <div className='mb-4'>
                            <div className='flex flex-wrap gap-2'>
                              {(index === 0
                                ? ['React', 'JSX', 'Hooks']
                                : index === 1
                                ? ['JavaScript', 'ES6+', 'Async/Await']
                                : index === 2
                                ? ['UI/UX', 'Figma', 'Responsive']
                                : [
                                    'Programming',
                                    'Problem Solving',
                                    'Best Practices',
                                  ]
                              ).map((skill) => (
                                <span
                                  key={skill}
                                  className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Certificate Actions */}
                          <div className='flex items-center justify-between pt-4 border-t border-gray-100'>
                            <div className='flex items-center space-x-2'>
                              <button className='flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors'>
                                <svg
                                  className='w-4 h-4'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                                  />
                                </svg>
                                <span>Download</span>
                              </button>
                              <button className='flex items-center space-x-1 text-gray-600 hover:text-gray-700 text-sm font-medium transition-colors'>
                                <svg
                                  className='w-4 h-4'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z'
                                  />
                                </svg>
                                <span>Share</span>
                              </button>
                            </div>
                            <button className='flex items-center space-x-1 text-green-600 hover:text-green-700 text-sm font-medium transition-colors'>
                              <svg
                                className='w-4 h-4'
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
                              <span>Verify</span>
                            </button>
                          </div>
                        </div>

                        {/* Hover Effect */}
                        <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className='text-center py-12'>
                  <div className='w-24 h-24 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                    <svg
                      className='w-12 h-12 text-yellow-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
                      />
                    </svg>
                  </div>
                  <h4 className='text-xl font-semibold text-gray-900 mb-2'>
                    No certificates yet
                  </h4>
                  <p className='text-gray-600 mb-6'>
                    Complete courses to earn your first certificate
                  </p>
                  <button
                    onClick={() => setActiveTab('browse-courses')}
                    className='bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200'
                  >
                    Start Learning
                  </button>
                </div>
              )}
            </div>

            {/* Upcoming Certificates */}
            {dashboardData.stats.inProgressCourses > 0 && (
              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                <h4 className='text-xl font-semibold text-gray-900 mb-6'>
                  Upcoming Certificates
                </h4>
                <div className='space-y-4'>
                  {enrolledCourses.slice(0, 3).map((course) => (
                    <div
                      key={course._id}
                      className='flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className='w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center'>
                          <svg
                            className='w-6 h-6 text-gray-600'
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
                        </div>
                        <div>
                          <h5 className='font-semibold text-gray-900'>
                            {course.title}
                          </h5>
                          <p className='text-sm text-gray-600'>
                            {course.progress || 0}% complete
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center space-x-3'>
                        <div className='w-16 bg-gray-200 rounded-full h-2'>
                          <div
                            className='bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full'
                            style={{ width: `${course.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className='text-sm font-medium text-gray-900 w-12 text-right'>
                          {course.progress || 0}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
