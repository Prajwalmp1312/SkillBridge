import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Play,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  Book,
  Download,
  Star,
  Users,
  ArrowLeft,
} from 'lucide-react';

const CoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [expandedChapters, setExpandedChapters] = useState(new Set());
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get(
        `http://localhost:5000/api/v1/student/course/${courseId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const courseData = response.data.data.course;
        setCourse(courseData);

        // Set first video as default
        if (courseData.chapters && courseData.chapters.length > 0) {
          const firstChapter = courseData.chapters[0];
          if (firstChapter.subchapters && firstChapter.subchapters.length > 0) {
            setCurrentVideo(firstChapter.subchapters[0]);
            setExpandedChapters(new Set([firstChapter._id]));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      setError('Failed to load course data');
    } finally {
      setLoading(false);
    }
  };

  const toggleChapter = (chapterId) => {
    const newExpanded = new Set(expandedChapters);
    if (newExpanded.has(chapterId)) {
      newExpanded.delete(chapterId);
    } else {
      newExpanded.add(chapterId);
    }
    setExpandedChapters(newExpanded);
  };

  const selectVideo = (subchapter) => {
    setCurrentVideo(subchapter);
  };

  const markAsCompleted = (lessonId) => {
    const newCompleted = new Set(completedLessons);
    if (newCompleted.has(lessonId)) {
      newCompleted.delete(lessonId);
    } else {
      newCompleted.add(lessonId);
    }
    setCompletedLessons(newCompleted);
  };

  const getProgressPercentage = () => {
    if (!course || !course.chapters) return 0;
    const totalLessons = course.chapters.reduce(
      (acc, chapter) => acc + (chapter.subchapters?.length || 0),
      0
    );
    return totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>Loading course...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 mb-4'>{error || 'Course not found'}</p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => navigate('/student-dashboard')}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <ArrowLeft className='h-5 w-5' />
            </button>
            <div>
              <h1 className='text-xl font-bold text-gray-900'>
                {course.title}
              </h1>
              <p className='text-sm text-gray-600'>by {course.tutor?.name}</p>
            </div>
          </div>

          <div className='flex items-center space-x-4'>
            <div className='text-right'>
              <p className='text-sm font-medium text-gray-900'>
                {Math.round(getProgressPercentage())}% Complete
              </p>
              <div className='w-32 h-2 bg-gray-200 rounded-full mt-1'>
                <div
                  className='h-2 bg-green-500 rounded-full transition-all duration-300'
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='flex h-[calc(100vh-80px)]'>
        {/* Video Player Section - Left Side */}
        <div className='flex-1 bg-black'>
          <div className='h-full flex flex-col'>
            {/* Video Player */}
            <div className='flex-1 flex items-center justify-center'>
              {currentVideo ? (
                <div className='w-full h-full bg-black relative'>
                  {currentVideo.videoUrl ? (
                    <video
                      className='w-full h-full object-contain'
                      controls
                      poster='/api/placeholder/800/450'
                    >
                      <source
                        src={currentVideo.videoUrl}
                        type='video/mp4'
                      />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className='flex items-center justify-center h-full text-white'>
                      <div className='text-center'>
                        <Play className='h-16 w-16 mx-auto mb-4 opacity-50' />
                        <p className='text-lg'>Video not available</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className='flex items-center justify-center h-full text-white'>
                  <div className='text-center'>
                    <Book className='h-16 w-16 mx-auto mb-4 opacity-50' />
                    <p className='text-lg'>Select a lesson to start</p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Info */}
            {currentVideo && (
              <div className='bg-white p-6 border-t'>
                <div className='flex items-center justify-between mb-4'>
                  <h2 className='text-xl font-bold text-gray-900'>
                    {currentVideo.title}
                  </h2>
                  <button
                    onClick={() => markAsCompleted(currentVideo._id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      completedLessons.has(currentVideo._id)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle className='h-4 w-4' />
                    <span>
                      {completedLessons.has(currentVideo._id)
                        ? 'Completed'
                        : 'Mark Complete'}
                    </span>
                  </button>
                </div>

                <p className='text-gray-600 mb-4'>{currentVideo.description}</p>

                <div className='flex items-center space-x-6 text-sm text-gray-500'>
                  <div className='flex items-center space-x-1'>
                    <Clock className='h-4 w-4' />
                    <span>{currentVideo.duration} minutes</span>
                  </div>
                </div>

                {/* Lesson Content */}
                {currentVideo.content && (
                  <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
                    <h3 className='font-semibold text-gray-900 mb-2'>
                      Lesson Notes
                    </h3>
                    <div className='prose prose-sm max-w-none text-gray-700'>
                      {currentVideo.content}
                    </div>
                  </div>
                )}

                {/* Resources */}
                {currentVideo.resources &&
                  currentVideo.resources.length > 0 && (
                    <div className='mt-6'>
                      <h3 className='font-semibold text-gray-900 mb-3'>
                        Resources
                      </h3>
                      <div className='space-y-2'>
                        {currentVideo.resources.map((resource, index) => (
                          <a
                            key={index}
                            href={resource.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='flex items-center space-x-2 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors'
                          >
                            <Download className='h-4 w-4 text-blue-600' />
                            <span className='text-blue-600 font-medium'>
                              {resource.title}
                            </span>
                            <span className='text-sm text-gray-500'>
                              ({resource.type})
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Course Curriculum - Right Side */}
        <div className='w-96 bg-white border-l overflow-y-auto'>
          <div className='p-6'>
            <h3 className='text-lg font-bold text-gray-900 mb-4'>
              Course Content
            </h3>

            {/* Course Stats */}
            <div className='grid grid-cols-2 gap-4 mb-6'>
              <div className='text-center p-3 bg-gray-50 rounded-lg'>
                <p className='text-sm text-gray-600'>Chapters</p>
                <p className='text-lg font-bold text-gray-900'>
                  {course.chapters?.length || 0}
                </p>
              </div>
              <div className='text-center p-3 bg-gray-50 rounded-lg'>
                <p className='text-sm text-gray-600'>Lessons</p>
                <p className='text-lg font-bold text-gray-900'>
                  {course.chapters?.reduce(
                    (acc, ch) => acc + (ch.subchapters?.length || 0),
                    0
                  ) || 0}
                </p>
              </div>
            </div>

            {/* Chapters List */}
            <div className='space-y-3'>
              {course.chapters?.map((chapter, chapterIndex) => (
                <div
                  key={chapter._id}
                  className='border rounded-lg overflow-hidden'
                >
                  <button
                    onClick={() => toggleChapter(chapter._id)}
                    className='w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors'
                  >
                    <div className='flex items-center space-x-3'>
                      {expandedChapters.has(chapter._id) ? (
                        <ChevronDown className='h-4 w-4 text-gray-600' />
                      ) : (
                        <ChevronRight className='h-4 w-4 text-gray-600' />
                      )}
                      <div className='text-left'>
                        <h4 className='font-semibold text-gray-900'>
                          {chapter.title}
                        </h4>
                        <p className='text-sm text-gray-600'>
                          {chapter.subchapters?.length || 0} lessons
                        </p>
                      </div>
                    </div>
                  </button>

                  {expandedChapters.has(chapter._id) && (
                    <div className='border-t bg-white'>
                      {chapter.subchapters?.map((subchapter, lessonIndex) => (
                        <button
                          key={subchapter._id}
                          onClick={() => selectVideo(subchapter)}
                          className={`w-full flex items-center space-x-3 p-4 text-left hover:bg-gray-50 transition-colors border-b last:border-b-0 ${
                            currentVideo?._id === subchapter._id
                              ? 'bg-blue-50 border-l-4 border-l-blue-600'
                              : ''
                          }`}
                        >
                          <div className='flex-shrink-0'>
                            {completedLessons.has(subchapter._id) ? (
                              <CheckCircle className='h-5 w-5 text-green-600' />
                            ) : (
                              <Play className='h-5 w-5 text-gray-400' />
                            )}
                          </div>

                          <div className='flex-1 min-w-0'>
                            <h5 className='font-medium text-gray-900 truncate'>
                              {subchapter.title}
                            </h5>
                            <div className='flex items-center space-x-2 text-sm text-gray-500'>
                              <Clock className='h-3 w-3' />
                              <span>{subchapter.duration} min</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;
