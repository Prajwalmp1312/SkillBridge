import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import axios from 'axios';

// Import icons (you can replace with your preferred icon library)
const TutorDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      totalStudents: 0,
      totalRevenue: 0,
      averageRating: 0,
    },
    recentCourses: [],
    recentActivity: [],
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    category: '',
    level: 'Beginner',
    language: 'English',
    price: 0,
    thumbnail: '',
    tags: [],
    prerequisites: [''],
    learningObjectives: [''],
    targetAudience: [],
    // Settings step fields
    isPublished: false,
    visibility: 'public',
    hasEnrollmentLimit: false,
    enrollmentLimit: null,
    hasCertificate: false,
    certificateTemplate: 'default',
    accessDuration: 'lifetime',
    discountPercentage: null,
    discountExpiry: '',
    seoTitle: '',
    metaDescription: '',
  });
  const [courseStep, setCourseStep] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [chapters, setChapters] = useState([]);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingSubchapter, setEditingSubchapter] = useState(null);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Check if user is tutor
  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');

    if (!token || userRole !== 'tutor') {
      enqueueSnackbar('Access denied. Tutor privileges required.', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      navigate('/tutor-login');
      return;
    }

    fetchDashboardData();
  }, [navigate, enqueueSnackbar]);

  // Load selected course data for editing
  useEffect(() => {
    if (selectedCourse && activeTab === 'create-course') {
      setCourseFormData({
        title: selectedCourse.title || '',
        description: selectedCourse.description || '',
        shortDescription: selectedCourse.shortDescription || '',
        category: selectedCourse.category || '',
        level: selectedCourse.level || 'Beginner',
        language: selectedCourse.language || 'English',
        price: selectedCourse.price || 0,
        thumbnail: selectedCourse.thumbnail || '',
        tags: selectedCourse.tags || [],
        prerequisites:
          selectedCourse.prerequisites?.length > 0
            ? selectedCourse.prerequisites
            : [''],
        learningObjectives:
          selectedCourse.learningObjectives?.length > 0
            ? selectedCourse.learningObjectives
            : [''],
        targetAudience: selectedCourse.targetAudience || [],
      });
      setChapters(selectedCourse.chapters || []);
    }
  }, [selectedCourse, activeTab]);

  // Load course data when editing
  useEffect(() => {
    if (selectedCourse && activeTab === 'create-course') {
      setCourseFormData({
        title: selectedCourse.title || '',
        description: selectedCourse.description || '',
        shortDescription: selectedCourse.shortDescription || '',
        category: selectedCourse.category || '',
        level: selectedCourse.level || 'Beginner',
        language: selectedCourse.language || 'English',
        price: selectedCourse.price || 0,
        thumbnail: selectedCourse.thumbnail || '',
        tags: selectedCourse.tags || [],
        prerequisites:
          selectedCourse.prerequisites?.length > 0
            ? selectedCourse.prerequisites
            : [''],
        learningObjectives:
          selectedCourse.learningObjectives?.length > 0
            ? selectedCourse.learningObjectives
            : [''],
        targetAudience: selectedCourse.targetAudience || [],
      });

      if (selectedCourse.chapters && selectedCourse.chapters.length > 0) {
        setChapters(
          selectedCourse.chapters.map((chapter) => ({
            title: chapter.title || '',
            description: chapter.description || '',
            order: chapter.order || 0,
            subchapters:
              chapter.subchapters?.map((subchapter) => ({
                title: subchapter.title || '',
                content: subchapter.content || '',
                videoUrl: subchapter.videoUrl || '',
                duration: subchapter.duration || 0,
                order: subchapter.order || 0,
              })) || [],
          }))
        );
      } else {
        setChapters([]);
      }
    }
  }, [selectedCourse, activeTab]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache',
        },
      };

      // Fetch tutor dashboard stats
      const statsResponse = await axios.get(
        'http://localhost:5000/api/v1/tutor/dashboard/stats',
        config
      );

      if (statsResponse.data.success) {
        setDashboardData((prev) => ({
          ...prev,
          stats: statsResponse.data.stats,
        }));
      }

      // Fetch tutor's courses
      const coursesResponse = await axios.get(
        'http://localhost:5000/api/v1/tutor/courses',
        config
      );

      if (coursesResponse.data.success) {
        setCourses(coursesResponse.data.courses);
        setDashboardData((prev) => ({
          ...prev,
          recentCourses: coursesResponse.data.courses.slice(0, 3),
        }));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        enqueueSnackbar('Session expired. Please login again.', {
          variant: 'error',
          autoHideDuration: 3000,
        });
        localStorage.clear();
        navigate('/tutor-login');
      } else {
        enqueueSnackbar('Error loading dashboard data', {
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

  // Course management functions
  const handleCreateCourse = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      // Prepare course data with chapters
      const courseData = {
        ...courseFormData,
        chapters: chapters.map((chapter, index) => ({
          title: chapter.title,
          description: chapter.description,
          order: index,
          subchapters: chapter.subchapters.map((subchapter, subIndex) => ({
            title: subchapter.title,
            content: subchapter.content,
            videoUrl: subchapter.videoUrl,
            duration: subchapter.duration,
            order: subIndex,
          })),
        })),
      };

      let response;
      if (selectedCourse) {
        // Update existing course
        response = await axios.put(
          `http://localhost:5000/api/v1/tutor/courses/${selectedCourse._id}`,
          courseData,
          config
        );
      } else {
        // Create new course
        response = await axios.post(
          'http://localhost:5000/api/v1/tutor/courses',
          courseData,
          config
        );
      }

      if (response.data.success) {
        enqueueSnackbar(
          selectedCourse
            ? 'Course updated successfully!'
            : 'Course created successfully!',
          {
            variant: 'success',
            autoHideDuration: 3000,
          }
        );
        fetchDashboardData();
        resetCourseForm();
        setSelectedCourse(null);
        setActiveTab('courses');
      }
    } catch (error) {
      console.error('Error saving course:', error);
      enqueueSnackbar(error.response?.data?.message || 'Error saving course', {
        variant: 'error',
        autoHideDuration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCourse = async (courseId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      };

      const response = await axios.put(
        `http://localhost:5000/api/v1/tutor/courses/${courseId}`,
        updateData,
        config
      );

      if (response.data.success) {
        enqueueSnackbar('Course updated successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating course:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error updating course',
        {
          variant: 'error',
          autoHideDuration: 5000,
        }
      );
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.delete(
        `http://localhost:5000/api/v1/tutor/courses/${courseId}`,
        config
      );

      if (response.data.success) {
        enqueueSnackbar('Course deleted successfully!', {
          variant: 'success',
          autoHideDuration: 3000,
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      enqueueSnackbar(
        error.response?.data?.message || 'Error deleting course',
        {
          variant: 'error',
          autoHideDuration: 5000,
        }
      );
    }
  };

  const addChapter = () => {
    const newChapter = {
      title: '',
      description: '',
      order: chapters.length,
      subchapters: [],
    };
    setChapters([...chapters, newChapter]);
  };

  const updateChapter = (chapterIndex, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex] = {
      ...updatedChapters[chapterIndex],
      [field]: value,
    };
    setChapters(updatedChapters);
  };

  const deleteChapter = (chapterIndex) => {
    const updatedChapters = chapters.filter(
      (_, index) => index !== chapterIndex
    );
    setChapters(updatedChapters);
  };

  const addSubchapter = (chapterIndex) => {
    const newSubchapter = {
      title: '',
      content: '',
      videoUrl: '',
      duration: 0,
      order: chapters[chapterIndex].subchapters.length,
    };

    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].subchapters.push(newSubchapter);
    setChapters(updatedChapters);
  };

  const updateSubchapter = (chapterIndex, subchapterIndex, field, value) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].subchapters[subchapterIndex] = {
      ...updatedChapters[chapterIndex].subchapters[subchapterIndex],
      [field]: value,
    };
    setChapters(updatedChapters);
  };

  const deleteSubchapter = (chapterIndex, subchapterIndex) => {
    const updatedChapters = [...chapters];
    updatedChapters[chapterIndex].subchapters = updatedChapters[
      chapterIndex
    ].subchapters.filter((_, index) => index !== subchapterIndex);
    setChapters(updatedChapters);
  };

  const resetCourseForm = () => {
    setCourseFormData({
      title: '',
      description: '',
      shortDescription: '',
      category: '',
      level: 'Beginner',
      language: 'English',
      price: 0,
      thumbnail: '',
      tags: [],
      prerequisites: [''],
      learningObjectives: [''],
      targetAudience: [],
      // Settings step fields
      isPublished: false,
      visibility: 'public',
      hasEnrollmentLimit: false,
      enrollmentLimit: null,
      hasCertificate: false,
      certificateTemplate: 'default',
      accessDuration: 'lifetime',
      discountPercentage: null,
      discountExpiry: '',
      seoTitle: '',
      metaDescription: '',
    });
    setChapters([]);
    setCurrentStep(0);
    setEditingChapter(null);
    setEditingSubchapter(null);
  };

  // Calculate total chapters for each course
  const calculateCourseStats = (course) => {
    const totalChapters = course.chapters?.length || 0;
    const totalSubchapters =
      course.chapters?.reduce(
        (sum, chapter) => sum + (chapter.subchapters?.length || 0),
        0
      ) || 0;
    return {
      totalChapters,
      totalSubchapters,
      enrollmentCount: course.enrollmentCount || 0,
    };
  };

  const tutorData = JSON.parse(localStorage.getItem('tutorData') || '{}');

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
              <div className='w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg'>
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
              <div>
                <h1 className='text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                  Tutor Dashboard
                </h1>
                <p className='text-sm text-gray-500'>
                  Manage your courses and students
                </p>
              </div>
            </div>
            <div className='flex items-center space-x-4'>
              <div className='hidden md:flex items-center space-x-2'>
                <div className='w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center'>
                  <span className='text-indigo-600 font-semibold text-sm'>
                    {tutorData.name?.charAt(0).toUpperCase() || 'T'}
                  </span>
                </div>
                <span className='text-gray-700 font-medium'>
                  Welcome, {tutorData.name}
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
              { id: 'courses', label: 'My Courses', icon: '📚' },
              { id: 'create-course', label: 'Create Course', icon: '➕' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'students', label: 'Students', icon: '👥' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-indigo-50'
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
                      Total Courses
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {dashboardData.stats.totalCourses}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                    </svg>
                  </div>
                </div>
                <div className='mt-4 flex items-center'>
                  <span className='text-sm text-green-600 font-medium'>
                    {dashboardData.stats.publishedCourses} Published
                  </span>
                  <span className='text-sm text-gray-500 ml-2'>
                    • {dashboardData.stats.draftCourses} Drafts
                  </span>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Students Enrolled
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {dashboardData.stats.totalStudents}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z' />
                    </svg>
                  </div>
                </div>
                <div className='mt-4'>
                  <span className='text-sm text-green-600 font-medium'>
                    +12% this month
                  </span>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Total Revenue
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      ₹{dashboardData.stats.totalRevenue?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                </div>
                <div className='mt-4'>
                  <span className='text-sm text-green-600 font-medium'>
                    +8% this month
                  </span>
                </div>
              </div>

              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-gray-600'>
                      Average Rating
                    </p>
                    <p className='text-3xl font-bold text-gray-900 mt-2'>
                      {dashboardData.stats.averageRating?.toFixed(1) || '0.0'}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  </div>
                </div>
                <div className='mt-4 flex items-center'>
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(dashboardData.stats.averageRating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Quick Actions
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <button
                  onClick={() => setActiveTab('create-course')}
                  className='flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200 group'
                >
                  <div className='w-8 h-8 bg-indigo-100 group-hover:bg-indigo-200 rounded-lg flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 text-indigo-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                      />
                    </svg>
                  </div>
                  <span className='font-medium text-gray-700 group-hover:text-indigo-700'>
                    Create New Course
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('courses')}
                  className='flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 transition-all duration-200 group'
                >
                  <div className='w-8 h-8 bg-green-100 group-hover:bg-green-200 rounded-lg flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 text-green-600'
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
                  <span className='font-medium text-gray-700 group-hover:text-green-700'>
                    Manage Courses
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('analytics')}
                  className='flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group'
                >
                  <div className='w-8 h-8 bg-purple-100 group-hover:bg-purple-200 rounded-lg flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 text-purple-600'
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
                  </div>
                  <span className='font-medium text-gray-700 group-hover:text-purple-700'>
                    View Analytics
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab('students')}
                  className='flex items-center space-x-3 p-4 rounded-xl border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 transition-all duration-200 group'
                >
                  <div className='w-8 h-8 bg-orange-100 group-hover:bg-orange-200 rounded-lg flex items-center justify-center'>
                    <svg
                      className='w-5 h-5 text-orange-600'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                      />
                    </svg>
                  </div>
                  <span className='font-medium text-gray-700 group-hover:text-orange-700'>
                    Manage Students
                  </span>
                </button>
              </div>
            </div>

            {/* Recent Courses */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Recent Courses
                </h3>
                <button
                  onClick={() => setActiveTab('courses')}
                  className='text-indigo-600 hover:text-indigo-800 text-sm font-medium'
                >
                  View All →
                </button>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {dashboardData.recentCourses.length > 0 ? (
                  dashboardData.recentCourses.map((course) => (
                    <div
                      key={course._id}
                      className='border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow duration-200'
                    >
                      <div className='flex items-start justify-between mb-3'>
                        <h4 className='font-medium text-gray-900 line-clamp-2'>
                          {course.title}
                        </h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            course.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {course.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      <p className='text-sm text-gray-600 mb-3 line-clamp-2'>
                        {course.description}
                      </p>
                      <div className='flex items-center justify-between text-sm text-gray-500'>
                        <span>{course.totalChapters || 0} chapters</span>
                        <span>{course.enrollmentCount || 0} students</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='col-span-full text-center py-8'>
                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                      <svg
                        className='w-8 h-8 text-gray-400'
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
                    <h4 className='text-lg font-medium text-gray-900 mb-2'>
                      No courses yet
                    </h4>
                    <p className='text-gray-600 mb-4'>
                      Create your first course to get started
                    </p>
                    <button
                      onClick={() => setActiveTab('create-course')}
                      className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors'
                    >
                      Create Course
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Courses Tab */}
        {activeTab === 'courses' && (
          <div className='space-y-6'>
            {/* Header */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    My Courses
                  </h3>
                  <p className='text-gray-600 mt-1'>
                    Manage and organize your courses
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('create-course')}
                  className='bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center space-x-2'
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
                      d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                    />
                  </svg>
                  <span>Create New Course</span>
                </button>
              </div>

              {/* Filters */}
              <div className='flex flex-wrap items-center gap-4 mb-6'>
                <div className='flex items-center space-x-2'>
                  <label className='text-sm font-medium text-gray-700'>
                    Status:
                  </label>
                  <select className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'>
                    <option value=''>All Courses</option>
                    <option value='published'>Published</option>
                    <option value='draft'>Draft</option>
                  </select>
                </div>
                <div className='flex items-center space-x-2'>
                  <label className='text-sm font-medium text-gray-700'>
                    Search:
                  </label>
                  <input
                    type='text'
                    placeholder='Search courses...'
                    className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64'
                  />
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {courses.map((course) => (
                <div
                  key={course._id}
                  className='bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1'
                >
                  {/* Course Thumbnail */}
                  <div className='h-48 bg-gradient-to-br from-indigo-500 to-purple-600 relative'>
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
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          course.isPublished
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {course.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className='p-6'>
                    <div className='flex items-start justify-between mb-3'>
                      <h4 className='text-lg font-semibold text-gray-900 line-clamp-2'>
                        {course.title}
                      </h4>
                      <div className='flex items-center space-x-1 ml-2'>
                        {/* Course Actions Dropdown */}
                        <div className='relative group'>
                          <button className='p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100'>
                            <svg
                              className='w-5 h-5'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path d='M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z' />
                            </svg>
                          </button>
                          <div className='absolute right-0 top-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10'>
                            <button
                              onClick={() => {
                                setSelectedCourse(course);
                                setActiveTab('create-course');
                              }}
                              className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'
                            >
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
                                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                />
                              </svg>
                              <span>Edit Course</span>
                            </button>
                            <button
                              onClick={() =>
                                handleUpdateCourse(course._id, {
                                  isPublished: !course.isPublished,
                                })
                              }
                              className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2'
                            >
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
                                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                />
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                />
                              </svg>
                              <span>
                                {course.isPublished ? 'Unpublish' : 'Publish'}
                              </span>
                            </button>
                            <hr className='my-1' />
                            <button
                              onClick={() => handleDeleteCourse(course._id)}
                              className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2'
                            >
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
                                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                />
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className='text-gray-600 text-sm mb-4 line-clamp-2'>
                      {course.description}
                    </p>

                    {/* Course Stats */}
                    <div className='flex items-center justify-between text-sm text-gray-500 mb-4'>
                      <div className='flex items-center space-x-4'>
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
                          <span>
                            {calculateCourseStats(course).totalChapters}{' '}
                            chapters
                          </span>
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
                              d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                            />
                          </svg>
                          <span>
                            {calculateCourseStats(course).enrollmentCount}{' '}
                            students
                          </span>
                        </span>
                      </div>
                      <span className='font-semibold text-gray-900'>
                        ₹{course.price || 0}
                      </span>
                    </div>

                    {/* Course Level and Category */}
                    <div className='flex items-center justify-between'>
                      <span className='px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full font-medium'>
                        {course.level}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {course.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {courses.length === 0 && (
                <div className='col-span-full'>
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
                          d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                        />
                      </svg>
                    </div>
                    <h4 className='text-xl font-semibold text-gray-900 mb-2'>
                      No courses yet
                    </h4>
                    <p className='text-gray-600 mb-6 max-w-md mx-auto'>
                      Start your teaching journey by creating your first course.
                      Share your knowledge and expertise with students
                      worldwide.
                    </p>
                    <button
                      onClick={() => setActiveTab('create-course')}
                      className='bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                    >
                      Create Your First Course
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Course Tab */}
        {activeTab === 'create-course' && (
          <div className='space-y-6'>
            {/* Header */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    {selectedCourse ? 'Edit Course' : 'Create New Course'}
                  </h3>
                  <p className='text-gray-600 mt-1'>
                    {selectedCourse
                      ? 'Update your course content and settings'
                      : 'Build an engaging learning experience for your students'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('courses');
                    setSelectedCourse(null);
                    resetCourseForm();
                  }}
                  className='text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100'
                >
                  <svg
                    className='w-6 h-6'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>

              {/* Progress Steps */}
              <div className='flex items-center space-x-4 mb-6'>
                {['Course Info', 'Content', 'Settings', 'Preview'].map(
                  (step, index) => (
                    <div
                      key={step}
                      className='flex items-center'
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                          index === currentStep
                            ? 'bg-indigo-600 text-white'
                            : index < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {index < currentStep ? (
                          <svg
                            className='w-5 h-5'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path
                              fillRule='evenodd'
                              d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                              clipRule='evenodd'
                            />
                          </svg>
                        ) : (
                          index + 1
                        )}
                      </div>
                      <span
                        className={`ml-2 text-sm font-medium ${
                          index <= currentStep
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        }`}
                      >
                        {step}
                      </span>
                      {index < 3 && (
                        <div
                          className={`w-12 h-0.5 ml-4 ${
                            index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                          }`}
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Step Content */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              {/* Step 1: Course Info */}
              {currentStep === 0 && (
                <div className='space-y-6'>
                  <h4 className='text-xl font-semibold text-gray-900 mb-6'>
                    Course Information
                  </h4>

                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    <div className='space-y-6'>
                      {/* Course Title */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Course Title *
                        </label>
                        <input
                          type='text'
                          value={courseFormData.title}
                          onChange={(e) =>
                            setCourseFormData((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          placeholder='Enter an engaging course title'
                          className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>

                      {/* Course Description */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Course Description *
                        </label>
                        <textarea
                          value={courseFormData.description}
                          onChange={(e) =>
                            setCourseFormData((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder='Describe what students will learn in this course...'
                          rows={4}
                          className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                        />
                      </div>

                      {/* Category and Level */}
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Category *
                          </label>
                          <select
                            value={courseFormData.category}
                            onChange={(e) =>
                              setCourseFormData((prev) => ({
                                ...prev,
                                category: e.target.value,
                              }))
                            }
                            className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                          >
                            <option value=''>Select Category</option>
                            <option value='Technology'>Technology</option>
                            <option value='Business'>Business</option>
                            <option value='Design'>Design</option>
                            <option value='Marketing'>Marketing</option>
                            <option value='Personal Development'>
                              Personal Development
                            </option>
                            <option value='Health & Fitness'>
                              Health & Fitness
                            </option>
                            <option value='Music'>Music</option>
                            <option value='Language'>Language</option>
                            <option value='Photography'>Photography</option>
                            <option value='Cooking'>Cooking</option>
                          </select>
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Difficulty Level *
                          </label>
                          <select
                            value={courseFormData.level}
                            onChange={(e) =>
                              setCourseFormData((prev) => ({
                                ...prev,
                                level: e.target.value,
                              }))
                            }
                            className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                          >
                            <option value=''>Select Level</option>
                            <option value='Beginner'>Beginner</option>
                            <option value='Intermediate'>Intermediate</option>
                            <option value='Advanced'>Advanced</option>
                            <option value='All Levels'>All Levels</option>
                          </select>
                        </div>
                      </div>

                      {/* Price and Duration */}
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Price (₹) *
                          </label>
                          <input
                            type='number'
                            value={courseFormData.price}
                            onChange={(e) =>
                              setCourseFormData((prev) => ({
                                ...prev,
                                price: Number(e.target.value),
                              }))
                            }
                            placeholder='2999'
                            min='0'
                            className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                          />
                        </div>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Duration (hours)
                          </label>
                          <input
                            type='number'
                            value={courseFormData.duration}
                            onChange={(e) =>
                              setCourseFormData((prev) => ({
                                ...prev,
                                duration: Number(e.target.value),
                              }))
                            }
                            placeholder='10'
                            min='0'
                            className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                          />
                        </div>
                      </div>
                    </div>

                    <div className='space-y-6'>
                      {/* Course Thumbnail */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Course Thumbnail
                        </label>
                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors'>
                          {courseFormData.thumbnail ? (
                            <div className='relative'>
                              <img
                                src={courseFormData.thumbnail}
                                alt='Course thumbnail'
                                className='w-full h-48 object-cover rounded-lg'
                              />
                              <button
                                onClick={() =>
                                  setCourseFormData((prev) => ({
                                    ...prev,
                                    thumbnail: '',
                                  }))
                                }
                                className='absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600'
                              >
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
                                    d='M6 18L18 6M6 6l12 12'
                                  />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <div>
                              <svg
                                className='w-12 h-12 text-gray-400 mx-auto mb-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                                />
                              </svg>
                              <p className='text-gray-600 mb-2'>
                                Upload course thumbnail
                              </p>
                              <input
                                type='file'
                                accept='image/*'
                                onChange={(e) => {
                                  const file = e.target.files[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      setCourseFormData((prev) => ({
                                        ...prev,
                                        thumbnail: e.target.result,
                                      }));
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className='hidden'
                                id='thumbnail-upload'
                              />
                              <label
                                htmlFor='thumbnail-upload'
                                className='inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-indigo-700'
                              >
                                Choose File
                              </label>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Learning Objectives */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          What will students learn?
                        </label>
                        <div className='space-y-2'>
                          {courseFormData.learningObjectives.map(
                            (objective, index) => (
                              <div
                                key={index}
                                className='flex items-center space-x-2'
                              >
                                <input
                                  type='text'
                                  value={objective}
                                  onChange={(e) => {
                                    const newObjectives = [
                                      ...courseFormData.learningObjectives,
                                    ];
                                    newObjectives[index] = e.target.value;
                                    setCourseFormData((prev) => ({
                                      ...prev,
                                      learningObjectives: newObjectives,
                                    }));
                                  }}
                                  placeholder='Learning objective...'
                                  className='flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                />
                                <button
                                  onClick={() => {
                                    const newObjectives =
                                      courseFormData.learningObjectives.filter(
                                        (_, i) => i !== index
                                      );
                                    setCourseFormData((prev) => ({
                                      ...prev,
                                      learningObjectives: newObjectives,
                                    }));
                                  }}
                                  className='text-red-500 hover:text-red-700 p-2'
                                >
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
                                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                    />
                                  </svg>
                                </button>
                              </div>
                            )
                          )}
                          <button
                            onClick={() => {
                              setCourseFormData((prev) => ({
                                ...prev,
                                learningObjectives: [
                                  ...prev.learningObjectives,
                                  '',
                                ],
                              }));
                            }}
                            className='w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors'
                          >
                            + Add Learning Objective
                          </button>
                        </div>
                      </div>

                      {/* Prerequisites */}
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Prerequisites (optional)
                        </label>
                        <div className='space-y-2'>
                          {courseFormData.prerequisites.map(
                            (prerequisite, index) => (
                              <div
                                key={index}
                                className='flex items-center space-x-2'
                              >
                                <input
                                  type='text'
                                  value={prerequisite}
                                  onChange={(e) => {
                                    const newPrerequisites = [
                                      ...courseFormData.prerequisites,
                                    ];
                                    newPrerequisites[index] = e.target.value;
                                    setCourseFormData((prev) => ({
                                      ...prev,
                                      prerequisites: newPrerequisites,
                                    }));
                                  }}
                                  placeholder='Prerequisite...'
                                  className='flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                />
                                <button
                                  onClick={() => {
                                    const newPrerequisites =
                                      courseFormData.prerequisites.filter(
                                        (_, i) => i !== index
                                      );
                                    setCourseFormData((prev) => ({
                                      ...prev,
                                      prerequisites: newPrerequisites,
                                    }));
                                  }}
                                  className='text-red-500 hover:text-red-700 p-2'
                                >
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
                                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                    />
                                  </svg>
                                </button>
                              </div>
                            )
                          )}
                          <button
                            onClick={() => {
                              setCourseFormData((prev) => ({
                                ...prev,
                                prerequisites: [...prev.prerequisites, ''],
                              }));
                            }}
                            className='w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-colors'
                          >
                            + Add Prerequisite
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Content (Chapters) */}
              {currentStep === 1 && (
                <div className='space-y-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h4 className='text-xl font-semibold text-gray-900'>
                      Course Content
                    </h4>
                    <button
                      onClick={addChapter}
                      className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2'
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
                          d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                        />
                      </svg>
                      <span>Add Chapter</span>
                    </button>
                  </div>

                  <div className='space-y-4'>
                    {chapters.map((chapter, chapterIndex) => (
                      <div
                        key={chapterIndex}
                        className='border border-gray-200 rounded-lg p-6 bg-gray-50'
                      >
                        <div className='flex items-center justify-between mb-4'>
                          <div className='flex items-center space-x-4 flex-1'>
                            <span className='bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium'>
                              Chapter {chapterIndex + 1}
                            </span>
                            {editingChapter === chapterIndex ? (
                              <input
                                type='text'
                                value={chapter.title}
                                onChange={(e) =>
                                  updateChapter(
                                    chapterIndex,
                                    'title',
                                    e.target.value
                                  )
                                }
                                onBlur={() => setEditingChapter(null)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    setEditingChapter(null);
                                  }
                                }}
                                className='flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                autoFocus
                              />
                            ) : (
                              <h5
                                className='text-lg font-medium text-gray-900 cursor-pointer hover:text-indigo-600 flex-1'
                                onClick={() => setEditingChapter(chapterIndex)}
                              >
                                {chapter.title || 'Click to edit chapter title'}
                              </h5>
                            )}
                          </div>
                          <div className='flex items-center space-x-2'>
                            <button
                              onClick={() => deleteChapter(chapterIndex)}
                              className='text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50'
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
                                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Chapter Description */}
                        <div className='mb-4'>
                          <textarea
                            value={chapter.description}
                            onChange={(e) =>
                              updateChapter(
                                chapterIndex,
                                'description',
                                e.target.value
                              )
                            }
                            placeholder='Chapter description...'
                            rows={2}
                            className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                          />
                        </div>

                        {/* Subchapters */}
                        <div className='space-y-3'>
                          <div className='flex items-center justify-between'>
                            <h6 className='text-sm font-medium text-gray-700'>
                              Subchapters
                            </h6>
                            <button
                              onClick={() => addSubchapter(chapterIndex)}
                              className='text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1'
                            >
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
                                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                                />
                              </svg>
                              <span>Add Subchapter</span>
                            </button>
                          </div>

                          {chapter.subchapters.map(
                            (subchapter, subchapterIndex) => (
                              <div
                                key={subchapterIndex}
                                className='bg-white border border-gray-200 rounded-lg p-4 ml-6'
                              >
                                <div className='flex items-center justify-between mb-3'>
                                  <div className='flex items-center space-x-3 flex-1'>
                                    <span className='bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium'>
                                      {chapterIndex + 1}.{subchapterIndex + 1}
                                    </span>
                                    {editingSubchapter ===
                                    `${chapterIndex}-${subchapterIndex}` ? (
                                      <input
                                        type='text'
                                        value={subchapter.title}
                                        onChange={(e) =>
                                          updateSubchapter(
                                            chapterIndex,
                                            subchapterIndex,
                                            'title',
                                            e.target.value
                                          )
                                        }
                                        onBlur={() =>
                                          setEditingSubchapter(null)
                                        }
                                        onKeyPress={(e) => {
                                          if (e.key === 'Enter') {
                                            setEditingSubchapter(null);
                                          }
                                        }}
                                        className='flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                        autoFocus
                                      />
                                    ) : (
                                      <h6
                                        className='font-medium text-gray-900 cursor-pointer hover:text-indigo-600 flex-1'
                                        onClick={() =>
                                          setEditingSubchapter(
                                            `${chapterIndex}-${subchapterIndex}`
                                          )
                                        }
                                      >
                                        {subchapter.title ||
                                          'Click to edit subchapter title'}
                                      </h6>
                                    )}
                                  </div>
                                  <button
                                    onClick={() =>
                                      deleteSubchapter(
                                        chapterIndex,
                                        subchapterIndex
                                      )
                                    }
                                    className='text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50'
                                  >
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
                                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                                      />
                                    </svg>
                                  </button>
                                </div>

                                {/* Subchapter Content */}
                                <div className='space-y-3'>
                                  <div>
                                    <textarea
                                      value={subchapter.content}
                                      onChange={(e) =>
                                        updateSubchapter(
                                          chapterIndex,
                                          subchapterIndex,
                                          'content',
                                          e.target.value
                                        )
                                      }
                                      placeholder='Subchapter content...'
                                      rows={3}
                                      className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                                    />
                                  </div>

                                  <div className='grid grid-cols-2 gap-3'>
                                    <div>
                                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                                        Video URL (optional)
                                      </label>
                                      <input
                                        type='url'
                                        value={subchapter.videoUrl}
                                        onChange={(e) =>
                                          updateSubchapter(
                                            chapterIndex,
                                            subchapterIndex,
                                            'videoUrl',
                                            e.target.value
                                          )
                                        }
                                        placeholder='https://...'
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                                      />
                                    </div>
                                    <div>
                                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                                        Duration (minutes)
                                      </label>
                                      <input
                                        type='number'
                                        value={subchapter.duration}
                                        onChange={(e) =>
                                          updateSubchapter(
                                            chapterIndex,
                                            subchapterIndex,
                                            'duration',
                                            Number(e.target.value)
                                          )
                                        }
                                        placeholder='15'
                                        min='0'
                                        className='w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          )}

                          {chapter.subchapters.length === 0 && (
                            <div className='text-center py-6 text-gray-500 text-sm'>
                              No subchapters yet. Click "Add Subchapter" to get
                              started.
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {chapters.length === 0 && (
                      <div className='text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300'>
                        <svg
                          className='w-16 h-16 text-gray-400 mx-auto mb-4'
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
                        <h4 className='text-lg font-medium text-gray-900 mb-2'>
                          No chapters yet
                        </h4>
                        <p className='text-gray-600 mb-4'>
                          Start building your course by adding your first
                          chapter.
                        </p>
                        <button
                          onClick={addChapter}
                          className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                        >
                          Add First Chapter
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Settings */}
              {currentStep === 2 && (
                <div className='space-y-6'>
                  <h4 className='text-xl font-semibold text-gray-900 mb-6'>
                    Course Settings
                  </h4>

                  <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                    {/* Publication Settings */}
                    <div className='space-y-6'>
                      <div className='bg-gray-50 rounded-xl p-6'>
                        <h5 className='text-lg font-semibold text-gray-900 mb-4'>
                          Publication Settings
                        </h5>

                        {/* Course Status */}
                        <div className='space-y-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-3'>
                              Course Status
                            </label>
                            <div className='space-y-3'>
                              <label className='flex items-center'>
                                <input
                                  type='radio'
                                  name='courseStatus'
                                  value='draft'
                                  checked={courseFormData.isPublished === false}
                                  onChange={() =>
                                    setCourseFormData((prev) => ({
                                      ...prev,
                                      isPublished: false,
                                    }))
                                  }
                                  className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300'
                                />
                                <span className='ml-3 text-sm text-gray-700'>
                                  <span className='font-medium'>Draft</span> -
                                  Save for later, not visible to students
                                </span>
                              </label>
                              <label className='flex items-center'>
                                <input
                                  type='radio'
                                  name='courseStatus'
                                  value='published'
                                  checked={courseFormData.isPublished === true}
                                  onChange={() =>
                                    setCourseFormData((prev) => ({
                                      ...prev,
                                      isPublished: true,
                                    }))
                                  }
                                  className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300'
                                />
                                <span className='ml-3 text-sm text-gray-700'>
                                  <span className='font-medium'>Published</span>{' '}
                                  - Live and available for enrollment
                                </span>
                              </label>
                            </div>
                          </div>

                          {/* Course Visibility */}
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Course Visibility
                            </label>
                            <select
                              value={courseFormData.visibility || 'public'}
                              onChange={(e) =>
                                setCourseFormData((prev) => ({
                                  ...prev,
                                  visibility: e.target.value,
                                }))
                              }
                              className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                            >
                              <option value='public'>
                                Public - Anyone can find and enroll
                              </option>
                              <option value='unlisted'>
                                Unlisted - Only accessible via direct link
                              </option>
                              <option value='private'>
                                Private - Invitation only
                              </option>
                            </select>
                          </div>

                          {/* Enrollment Limit */}
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Enrollment Limit
                            </label>
                            <div className='flex items-center space-x-3'>
                              <input
                                type='checkbox'
                                checked={
                                  courseFormData.hasEnrollmentLimit || false
                                }
                                onChange={(e) =>
                                  setCourseFormData((prev) => ({
                                    ...prev,
                                    hasEnrollmentLimit: e.target.checked,
                                    enrollmentLimit: e.target.checked
                                      ? prev.enrollmentLimit || 100
                                      : null,
                                  }))
                                }
                                className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                              />
                              <span className='text-sm text-gray-700'>
                                Set enrollment limit
                              </span>
                            </div>
                            {courseFormData.hasEnrollmentLimit && (
                              <input
                                type='number'
                                value={courseFormData.enrollmentLimit || 100}
                                onChange={(e) =>
                                  setCourseFormData((prev) => ({
                                    ...prev,
                                    enrollmentLimit: Number(e.target.value),
                                  }))
                                }
                                placeholder='100'
                                min='1'
                                className='mt-2 w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Certificate Settings */}
                      <div className='bg-gray-50 rounded-xl p-6'>
                        <h5 className='text-lg font-semibold text-gray-900 mb-4'>
                          Certificate Settings
                        </h5>
                        <div className='space-y-4'>
                          <div className='flex items-center space-x-3'>
                            <input
                              type='checkbox'
                              checked={courseFormData.hasCertificate || false}
                              onChange={(e) =>
                                setCourseFormData((prev) => ({
                                  ...prev,
                                  hasCertificate: e.target.checked,
                                }))
                              }
                              className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                            />
                            <span className='text-sm font-medium text-gray-700'>
                              Issue completion certificate
                            </span>
                          </div>
                          {courseFormData.hasCertificate && (
                            <div>
                              <label className='block text-sm font-medium text-gray-700 mb-2'>
                                Certificate Template
                              </label>
                              <select
                                value={
                                  courseFormData.certificateTemplate ||
                                  'default'
                                }
                                onChange={(e) =>
                                  setCourseFormData((prev) => ({
                                    ...prev,
                                    certificateTemplate: e.target.value,
                                  }))
                                }
                                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                              >
                                <option value='default'>
                                  Default Template
                                </option>
                                <option value='modern'>Modern Template</option>
                                <option value='classic'>
                                  Classic Template
                                </option>
                                <option value='professional'>
                                  Professional Template
                                </option>
                              </select>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Access & Pricing Settings */}
                    <div className='space-y-6'>
                      <div className='bg-gray-50 rounded-xl p-6'>
                        <h5 className='text-lg font-semibold text-gray-900 mb-4'>
                          Access & Pricing
                        </h5>

                        <div className='space-y-4'>
                          {/* Course Access Duration */}
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Course Access Duration
                            </label>
                            <select
                              value={
                                courseFormData.accessDuration || 'lifetime'
                              }
                              onChange={(e) =>
                                setCourseFormData((prev) => ({
                                  ...prev,
                                  accessDuration: e.target.value,
                                }))
                              }
                              className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                            >
                              <option value='lifetime'>Lifetime Access</option>
                              <option value='1year'>1 Year</option>
                              <option value='6months'>6 Months</option>
                              <option value='3months'>3 Months</option>
                              <option value='1month'>1 Month</option>
                            </select>
                          </div>

                          {/* Discount Settings */}
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Discount (Optional)
                            </label>
                            <div className='grid grid-cols-2 gap-3'>
                              <div>
                                <input
                                  type='number'
                                  value={
                                    courseFormData.discountPercentage || ''
                                  }
                                  onChange={(e) =>
                                    setCourseFormData((prev) => ({
                                      ...prev,
                                      discountPercentage: Number(
                                        e.target.value
                                      ),
                                    }))
                                  }
                                  placeholder='Discount %'
                                  min='0'
                                  max='100'
                                  className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                />
                              </div>
                              <div>
                                <input
                                  type='date'
                                  value={courseFormData.discountExpiry || ''}
                                  onChange={(e) =>
                                    setCourseFormData((prev) => ({
                                      ...prev,
                                      discountExpiry: e.target.value,
                                    }))
                                  }
                                  className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                />
                              </div>
                            </div>
                          </div>

                          {/* Course Tags */}
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Course Tags
                            </label>
                            <div className='space-y-2'>
                              <input
                                type='text'
                                placeholder='Add tags separated by commas (e.g., React, JavaScript, Frontend)'
                                value={courseFormData.tags?.join(', ') || ''}
                                onChange={(e) => {
                                  const tags = e.target.value
                                    .split(',')
                                    .map((tag) => tag.trim())
                                    .filter((tag) => tag);
                                  setCourseFormData((prev) => ({
                                    ...prev,
                                    tags,
                                  }));
                                }}
                                className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                              />
                              <div className='flex flex-wrap gap-2 mt-2'>
                                {courseFormData.tags?.map((tag, index) => (
                                  <span
                                    key={index}
                                    className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800'
                                  >
                                    {tag}
                                    <button
                                      onClick={() => {
                                        const newTags =
                                          courseFormData.tags.filter(
                                            (_, i) => i !== index
                                          );
                                        setCourseFormData((prev) => ({
                                          ...prev,
                                          tags: newTags,
                                        }));
                                      }}
                                      className='ml-1 text-indigo-600 hover:text-indigo-800'
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* SEO Settings */}
                      <div className='bg-gray-50 rounded-xl p-6'>
                        <h5 className='text-lg font-semibold text-gray-900 mb-4'>
                          SEO & Marketing
                        </h5>
                        <div className='space-y-4'>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              SEO Title
                            </label>
                            <input
                              type='text'
                              value={
                                courseFormData.seoTitle || courseFormData.title
                              }
                              onChange={(e) =>
                                setCourseFormData((prev) => ({
                                  ...prev,
                                  seoTitle: e.target.value,
                                }))
                              }
                              placeholder='SEO optimized title'
                              className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                            />
                          </div>
                          <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>
                              Meta Description
                            </label>
                            <textarea
                              value={courseFormData.metaDescription || ''}
                              onChange={(e) =>
                                setCourseFormData((prev) => ({
                                  ...prev,
                                  metaDescription: e.target.value,
                                }))
                              }
                              placeholder='Brief description for search engines (150-160 characters)'
                              rows={3}
                              maxLength={160}
                              className='w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                            />
                            <p className='text-xs text-gray-500 mt-1'>
                              {(courseFormData.metaDescription || '').length}
                              /160 characters
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Preview */}
              {currentStep === 3 && (
                <div className='space-y-6'>
                  <h4 className='text-xl font-semibold text-gray-900 mb-6'>
                    Course Preview
                  </h4>

                  {/* Course Preview Card */}
                  <div className='bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200'>
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                      {/* Course Info Preview */}
                      <div className='space-y-6'>
                        <div>
                          <h3 className='text-2xl font-bold text-gray-900 mb-2'>
                            {courseFormData.title}
                          </h3>
                          <p className='text-gray-600 mb-4'>
                            {courseFormData.description}
                          </p>

                          <div className='flex items-center space-x-4 mb-4'>
                            <span className='px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium'>
                              {courseFormData.category}
                            </span>
                            <span className='px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium'>
                              {courseFormData.level}
                            </span>
                            <span className='px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full font-medium'>
                              {courseFormData.language}
                            </span>
                          </div>

                          <div className='flex items-center justify-between'>
                            <div className='text-3xl font-bold text-indigo-600'>
                              ₹{courseFormData.price?.toLocaleString()}
                              {courseFormData.discountPercentage && (
                                <span className='text-lg text-gray-500 line-through ml-2'>
                                  ₹
                                  {Math.round(
                                    courseFormData.price /
                                      (1 -
                                        courseFormData.discountPercentage / 100)
                                  ).toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className='text-right'>
                              <p className='text-sm text-gray-600'>Duration</p>
                              <p className='font-semibold'>
                                {courseFormData.duration} hours
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Learning Objectives Preview */}
                        {courseFormData.learningObjectives?.filter((obj) =>
                          obj.trim()
                        ).length > 0 && (
                          <div>
                            <h4 className='font-semibold text-gray-900 mb-3'>
                              What you'll learn:
                            </h4>
                            <ul className='space-y-2'>
                              {courseFormData.learningObjectives
                                .filter((obj) => obj.trim())
                                .map((objective, index) => (
                                  <li
                                    key={index}
                                    className='flex items-start space-x-2'
                                  >
                                    <svg
                                      className='w-5 h-5 text-green-500 mt-0.5 flex-shrink-0'
                                      fill='none'
                                      stroke='currentColor'
                                      viewBox='0 0 24 24'
                                    >
                                      <path
                                        strokeLinecap='round'
                                        strokeLinejoin='round'
                                        strokeWidth={2}
                                        d='M5 13l4 4L19 7'
                                      />
                                    </svg>
                                    <span className='text-sm text-gray-700'>
                                      {objective}
                                    </span>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}

                        {/* Prerequisites Preview */}
                        {courseFormData.prerequisites?.filter((prereq) =>
                          prereq.trim()
                        ).length > 0 && (
                          <div>
                            <h4 className='font-semibold text-gray-900 mb-3'>
                              Prerequisites:
                            </h4>
                            <ul className='space-y-1'>
                              {courseFormData.prerequisites
                                .filter((prereq) => prereq.trim())
                                .map((prerequisite, index) => (
                                  <li
                                    key={index}
                                    className='text-sm text-gray-600'
                                  >
                                    • {prerequisite}
                                  </li>
                                ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Course Thumbnail Preview */}
                      <div className='space-y-6'>
                        <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200'>
                          {courseFormData.thumbnail ? (
                            <img
                              src={courseFormData.thumbnail}
                              alt='Course thumbnail'
                              className='w-full h-48 object-cover rounded-lg'
                            />
                          ) : (
                            <div className='w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center'>
                              <svg
                                className='w-16 h-16 text-gray-400'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={1}
                                  d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                                />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Course Stats Preview */}
                        <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200'>
                          <h4 className='font-semibold text-gray-900 mb-3'>
                            Course Content
                          </h4>
                          <div className='space-y-3'>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='text-gray-600'>Chapters</span>
                              <span className='font-medium'>
                                {chapters.length}
                              </span>
                            </div>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='text-gray-600'>Lessons</span>
                              <span className='font-medium'>
                                {chapters.reduce(
                                  (sum, chapter) =>
                                    sum + (chapter.subchapters?.length || 0),
                                  0
                                )}
                              </span>
                            </div>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='text-gray-600'>
                                Total Duration
                              </span>
                              <span className='font-medium'>
                                {courseFormData.duration} hours
                              </span>
                            </div>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='text-gray-600'>Certificate</span>
                              <span className='font-medium'>
                                {courseFormData.hasCertificate ? 'Yes' : 'No'}
                              </span>
                            </div>
                            <div className='flex items-center justify-between text-sm'>
                              <span className='text-gray-600'>Access</span>
                              <span className='font-medium'>
                                {courseFormData.accessDuration === 'lifetime'
                                  ? 'Lifetime'
                                  : courseFormData.accessDuration}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Tags Preview */}
                        {courseFormData.tags?.length > 0 && (
                          <div className='bg-white rounded-xl p-4 shadow-sm border border-gray-200'>
                            <h4 className='font-semibold text-gray-900 mb-3'>
                              Tags
                            </h4>
                            <div className='flex flex-wrap gap-2'>
                              {courseFormData.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className='px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full'
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Course Outline Preview */}
                    {chapters.length > 0 && (
                      <div className='mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-200'>
                        <h4 className='font-semibold text-gray-900 mb-4'>
                          Course Outline
                        </h4>
                        <div className='space-y-4'>
                          {chapters.map((chapter, index) => (
                            <div
                              key={index}
                              className='border border-gray-200 rounded-lg p-4'
                            >
                              <h5 className='font-medium text-gray-900 mb-2'>
                                Chapter {index + 1}: {chapter.title}
                              </h5>
                              {chapter.description && (
                                <p className='text-sm text-gray-600 mb-3'>
                                  {chapter.description}
                                </p>
                              )}
                              {chapter.subchapters?.length > 0 && (
                                <div className='space-y-2'>
                                  {chapter.subchapters.map(
                                    (subchapter, subIndex) => (
                                      <div
                                        key={subIndex}
                                        className='flex items-center space-x-3 text-sm'
                                      >
                                        <span className='text-gray-400'>
                                          {index + 1}.{subIndex + 1}
                                        </span>
                                        <span className='text-gray-700'>
                                          {subchapter.title}
                                        </span>
                                        {subchapter.duration > 0 && (
                                          <span className='text-gray-500'>
                                            ({subchapter.duration} min)
                                          </span>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className='flex items-center justify-between pt-6 border-t border-gray-200'>
                <button
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>

                <div className='flex items-center space-x-4'>
                  <button
                    onClick={() => {
                      setActiveTab('courses');
                      setSelectedCourse(null);
                      resetCourseForm();
                    }}
                    className='px-6 py-3 rounded-lg font-medium text-gray-600 hover:text-gray-800 transition-colors'
                  >
                    Cancel
                  </button>

                  {currentStep < 3 ? (
                    <button
                      onClick={() =>
                        setCurrentStep(Math.min(3, currentStep + 1))
                      }
                      className='bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors'
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleCreateCourse}
                      disabled={isLoading}
                      className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className='animate-spin w-5 h-5'
                            fill='none'
                            viewBox='0 0 24 24'
                          >
                            <circle
                              className='opacity-25'
                              cx='12'
                              cy='12'
                              r='10'
                              stroke='currentColor'
                              strokeWidth='4'
                            ></circle>
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            ></path>
                          </svg>
                          <span>Creating...</span>
                        </>
                      ) : (
                        <span>
                          {selectedCourse ? 'Update Course' : 'Create Course'}
                        </span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className='space-y-6'>
            {/* Analytics Header */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    Analytics Dashboard
                  </h3>
                  <p className='text-gray-600 mt-1'>
                    Track your performance and insights
                  </p>
                </div>
                <div className='flex items-center space-x-3'>
                  <select className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'>
                    <option value='7'>Last 7 days</option>
                    <option value='30'>Last 30 days</option>
                    <option value='90'>Last 90 days</option>
                    <option value='365'>Last year</option>
                  </select>
                  <button className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2'>
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
                        d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                      />
                    </svg>
                    <span>Export Report</span>
                  </button>
                </div>
              </div>

              {/* Key Metrics */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-blue-600 font-medium text-sm'>
                        Total Revenue
                      </p>
                      <p className='text-2xl font-bold text-blue-900 mt-2'>
                        ₹{dashboardData.stats.totalRevenue?.toLocaleString()}
                      </p>
                      <p className='text-blue-600 text-sm mt-1'>
                        +12.5% from last month
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center'>
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
                          d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6 border border-green-200'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-green-600 font-medium text-sm'>
                        Course Completion Rate
                      </p>
                      <p className='text-2xl font-bold text-green-900 mt-2'>
                        78.5%
                      </p>
                      <p className='text-green-600 text-sm mt-1'>
                        +5.2% improvement
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center'>
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

                <div className='bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-purple-600 font-medium text-sm'>
                        Average Rating
                      </p>
                      <p className='text-2xl font-bold text-purple-900 mt-2'>
                        {dashboardData.stats.averageRating.toFixed(1)}
                      </p>
                      <p className='text-purple-600 text-sm mt-1'>
                        Across all courses
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center'>
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
                          d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-yellow-600 font-medium text-sm'>
                        Active Students
                      </p>
                      <p className='text-2xl font-bold text-yellow-900 mt-2'>
                        {dashboardData.stats.totalStudents}
                      </p>
                      <p className='text-yellow-600 text-sm mt-1'>
                        Currently enrolled
                      </p>
                    </div>
                    <div className='w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center'>
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
                          d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {/* Revenue Chart */}
              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                <div className='flex items-center justify-between mb-6'>
                  <h4 className='text-lg font-semibold text-gray-900'>
                    Revenue Trends
                  </h4>
                  <div className='flex items-center space-x-2'>
                    <div className='w-3 h-3 bg-indigo-500 rounded-full'></div>
                    <span className='text-sm text-gray-600'>
                      Monthly Revenue
                    </span>
                  </div>
                </div>
                <div className='h-64 flex items-end justify-between space-x-2'>
                  {[12, 19, 15, 25, 22, 30, 28, 35, 32, 40, 38, 45].map(
                    (height, index) => (
                      <div
                        key={index}
                        className='flex flex-col items-center'
                      >
                        <div
                          className='bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg w-8 transition-all duration-300 hover:from-indigo-600 hover:to-indigo-500'
                          style={{ height: `${height * 4}px` }}
                        ></div>
                        <span className='text-xs text-gray-500 mt-2'>
                          {
                            [
                              'Jan',
                              'Feb',
                              'Mar',
                              'Apr',
                              'May',
                              'Jun',
                              'Jul',
                              'Aug',
                              'Sep',
                              'Oct',
                              'Nov',
                              'Dec',
                            ][index]
                          }
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Course Performance */}
              <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                <h4 className='text-lg font-semibold text-gray-900 mb-6'>
                  Top Performing Courses
                </h4>
                <div className='space-y-4'>
                  {courses.slice(0, 5).map((course, index) => (
                    <div
                      key={course._id}
                      className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center'>
                          <span className='text-white font-semibold text-sm'>
                            {index + 1}
                          </span>
                        </div>
                        <div>
                          <h5 className='font-medium text-gray-900'>
                            {course.title}
                          </h5>
                          <p className='text-sm text-gray-600'>
                            {calculateCourseStats(course).enrollmentCount}{' '}
                            students
                          </p>
                        </div>
                      </div>
                      <div className='text-right'>
                        <p className='font-semibold text-gray-900'>
                          ₹
                          {(
                            course.price *
                            calculateCourseStats(course).enrollmentCount
                          ).toLocaleString()}
                        </p>
                        <p className='text-sm text-gray-600'>Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Student Engagement */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <h4 className='text-lg font-semibold text-gray-900 mb-6'>
                Student Engagement Insights
              </h4>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl'>
                  <div className='w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4'>
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
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <h5 className='text-lg font-semibold text-gray-900 mb-2'>
                    Average Watch Time
                  </h5>
                  <p className='text-2xl font-bold text-blue-600'>24.5 min</p>
                  <p className='text-sm text-gray-600 mt-1'>Per session</p>
                </div>

                <div className='text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl'>
                  <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4'>
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
                        d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                      />
                    </svg>
                  </div>
                  <h5 className='text-lg font-semibold text-gray-900 mb-2'>
                    Course Completion
                  </h5>
                  <p className='text-2xl font-bold text-green-600'>78%</p>
                  <p className='text-sm text-gray-600 mt-1'>Overall rate</p>
                </div>

                <div className='text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl'>
                  <div className='w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4'>
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
                        d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                      />
                    </svg>
                  </div>
                  <h5 className='text-lg font-semibold text-gray-900 mb-2'>
                    Student Feedback
                  </h5>
                  <p className='text-2xl font-bold text-purple-600'>4.8/5</p>
                  <p className='text-sm text-gray-600 mt-1'>Average rating</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className='space-y-6'>
            {/* Students Header */}
            <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    Student Management
                  </h3>
                  <p className='text-gray-600 mt-1'>
                    Manage your students and track their progress
                  </p>
                </div>
                <div className='flex items-center space-x-3'>
                  <div className='relative'>
                    <input
                      type='text'
                      placeholder='Search students...'
                      className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64'
                    />
                    <svg
                      className='w-5 h-5 text-gray-400 absolute left-3 top-2.5'
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
                  <button className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2'>
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
                        d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                      />
                    </svg>
                    <span>Export List</span>
                  </button>
                </div>
              </div>

              {/* Student Stats */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-5 h-5 text-white'
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
                    </div>
                    <div>
                      <p className='text-blue-600 font-medium text-sm'>
                        Total Students
                      </p>
                      <p className='text-xl font-bold text-blue-900'>
                        {dashboardData.stats.totalStudents}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-5 h-5 text-white'
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
                    <div>
                      <p className='text-green-600 font-medium text-sm'>
                        Active This Week
                      </p>
                      <p className='text-xl font-bold text-green-900'>
                        {Math.floor(dashboardData.stats.totalStudents * 0.75)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-5 h-5 text-white'
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
                    <div>
                      <p className='text-purple-600 font-medium text-sm'>
                        Completion Rate
                      </p>
                      <p className='text-xl font-bold text-purple-900'>78%</p>
                    </div>
                  </div>
                </div>

                <div className='bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200'>
                  <div className='flex items-center space-x-3'>
                    <div className='w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center'>
                      <svg
                        className='w-5 h-5 text-white'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                        />
                      </svg>
                    </div>
                    <div>
                      <p className='text-yellow-600 font-medium text-sm'>
                        Avg. Rating
                      </p>
                      <p className='text-xl font-bold text-yellow-900'>
                        {dashboardData.stats.averageRating.toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-200 bg-gray-50'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-lg font-semibold text-gray-900'>
                    Recent Enrollments
                  </h4>
                  <div className='flex items-center space-x-2'>
                    <select className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'>
                      <option value='all'>All Courses</option>
                      {courses.map((course) => (
                        <option
                          key={course._id}
                          value={course._id}
                        >
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Student
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Course
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Progress
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Enrolled
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {/* Sample student data - in real app this would come from API */}
                    {[
                      {
                        id: 1,
                        name: 'John Doe',
                        email: 'john@example.com',
                        course: 'React Development',
                        progress: 75,
                        enrolled: '2024-01-15',
                        status: 'Active',
                      },
                      {
                        id: 2,
                        name: 'Jane Smith',
                        email: 'jane@example.com',
                        course: 'Node.js Backend',
                        progress: 45,
                        enrolled: '2024-01-18',
                        status: 'Active',
                      },
                      {
                        id: 3,
                        name: 'Mike Johnson',
                        email: 'mike@example.com',
                        course: 'Full Stack Dev',
                        progress: 90,
                        enrolled: '2024-01-10',
                        status: 'Completed',
                      },
                      {
                        id: 4,
                        name: 'Sarah Wilson',
                        email: 'sarah@example.com',
                        course: 'React Development',
                        progress: 30,
                        enrolled: '2024-01-20',
                        status: 'Active',
                      },
                      {
                        id: 5,
                        name: 'Tom Brown',
                        email: 'tom@example.com',
                        course: 'Node.js Backend',
                        progress: 60,
                        enrolled: '2024-01-12',
                        status: 'Active',
                      },
                    ].map((student) => (
                      <tr
                        key={student.id}
                        className='hover:bg-gray-50'
                      >
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center'>
                            <div className='w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center'>
                              <span className='text-white font-semibold text-sm'>
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <div className='ml-4'>
                              <div className='text-sm font-medium text-gray-900'>
                                {student.name}
                              </div>
                              <div className='text-sm text-gray-500'>
                                {student.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-900'>
                            {student.course}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center'>
                            <div className='w-full bg-gray-200 rounded-full h-2 mr-3'>
                              <div
                                className='bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full'
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                            <span className='text-sm text-gray-900 font-medium'>
                              {student.progress}%
                            </span>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {new Date(student.enrolled).toLocaleDateString()}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              student.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : student.status === 'Completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <div className='flex items-center space-x-2'>
                            <button className='text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50'>
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
                                  d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                                />
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                                />
                              </svg>
                            </button>
                            <button className='text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50'>
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
                                  d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm text-gray-700'>
                    Showing <span className='font-medium'>1</span> to{' '}
                    <span className='font-medium'>5</span> of{' '}
                    <span className='font-medium'>
                      {dashboardData.stats.totalStudents}
                    </span>{' '}
                    students
                  </div>
                  <div className='flex items-center space-x-2'>
                    <button className='px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50'>
                      Previous
                    </button>
                    <button className='px-3 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700'>
                      1
                    </button>
                    <button className='px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50'>
                      2
                    </button>
                    <button className='px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50'>
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorDashboard;
