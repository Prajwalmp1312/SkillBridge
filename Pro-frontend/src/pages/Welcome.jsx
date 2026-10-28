import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Glossy Top Navigation */}
      <nav className='bg-gradient-to-r from-white/20 via-white/30 to-white/20 backdrop-blur-xl border-b border-white/40 sticky top-0 z-50 shadow-2xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center h-20'>
            {/* Logo/Brand */}
            <div className='flex items-center'>
              <div className='flex-shrink-0 flex items-center'>
                <div className='p-2 bg-white backdrop-blur-sm rounded-xl border border-white/30 shadow-lg'>
                  <svg
                    width='32'
                    height='32'
                    fill='none'
                    viewBox='0 0 24 24'
                    className='drop-shadow-md'
                  >
                    <rect
                      width='24'
                      height='24'
                      rx='12'
                      fill='#6366F1'
                    />
                    <path
                      d='M7 17V7h10v10H7zm2-2h6V9H9v6z'
                      fill='#fff'
                    />
                  </svg>
                </div>
                <span className='ml-3 text-gray-800 font-bold text-2xl drop-shadow-sm'>
                  SkillBridge
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className='flex items-center space-x-4'>
              <Link
                to='/login'
                className='px-4 py-2 text-gray-800 hover:text-blue-700 font-medium transition-all duration-300 hover:bg-white/20 rounded-lg backdrop-blur-sm border border-transparent hover:border-white/40'
              >
                Login
              </Link>
              <Link
                to='/signup'
                className='px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/20'
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900'>
        {/* Hero Section */}
        <div className='relative overflow-hidden'>
          {/* Background Pattern */}
          <div className='absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-pink-500/10'></div>

          <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16'>
            <div className='text-center'>
              <h1 className='text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight'>
                Unlock Your
                <span className='block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600'>
                  Potential
                </span>
              </h1>

              <p className='text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed'>
                Discover thousands of courses from expert tutors. Learn new
                skills, advance your career, and achieve your goals with
                SkillBridge's premium learning platform.
              </p>

              <div className='flex flex-col sm:flex-row gap-6 justify-center items-center mb-16'>
                <Link
                  to='/signup'
                  className='px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25'
                >
                  🚀 Start Learning Today
                </Link>

                <Link
                  to='/login'
                  className='px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-lg font-semibold rounded-full hover:bg-white/20 transform hover:scale-105 transition-all duration-300'
                >
                  Sign In to Continue
                </Link>
              </div>

              {/* Stats Section */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto'>
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20'>
                  <div className='text-3xl font-bold text-blue-400 mb-2'>
                    10,000+
                  </div>
                  <div className='text-gray-300'>Premium Courses</div>
                </div>
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20'>
                  <div className='text-3xl font-bold text-purple-400 mb-2'>
                    50,000+
                  </div>
                  <div className='text-gray-300'>Happy Students</div>
                </div>
                <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20'>
                  <div className='text-3xl font-bold text-pink-400 mb-2'>
                    1,000+
                  </div>
                  <div className='text-gray-300'>Expert Tutors</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className='py-20 bg-black/20'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
                Why Choose SkillBridge?
              </h2>
              <p className='text-xl text-gray-300 max-w-2xl mx-auto'>
                The ultimate learning experience designed for your success
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {/* Feature 1 */}
              <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
                <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6'>
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
                      d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>
                  Premium Courses
                </h3>
                <p className='text-gray-300'>
                  Access thousands of high-quality courses across technology,
                  business, design, and more.
                </p>
              </div>

              {/* Feature 2 */}
              <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
                <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6'>
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
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>
                  Expert Tutors
                </h3>
                <p className='text-gray-300'>
                  Learn from industry professionals and certified instructors
                  with real-world experience.
                </p>
              </div>

              {/* Feature 3 */}
              <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
                <div className='w-16 h-16 bg-gradient-to-r from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6'>
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
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>
                  Certificates
                </h3>
                <p className='text-gray-300'>
                  Earn verified certificates upon completion to showcase your
                  new skills to employers.
                </p>
              </div>

              {/* Feature 4 */}
              <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
                <div className='w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6'>
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
                <h3 className='text-xl font-bold text-white mb-4'>
                  Flexible Learning
                </h3>
                <p className='text-gray-300'>
                  Study at your own pace with lifetime access to courses and
                  mobile-friendly content.
                </p>
              </div>

              {/* Feature 5 */}
              <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
                <div className='w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6'>
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
                      d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>
                  Community Support
                </h3>
                <p className='text-gray-300'>
                  Connect with fellow learners and get help from our active
                  community of students and tutors.
                </p>
              </div>

              {/* Feature 6 */}
              <div className='bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300'>
                <div className='w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6'>
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
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-xl font-bold text-white mb-4'>
                  Affordable Pricing
                </h3>
                <p className='text-gray-300'>
                  Quality education at competitive prices with frequent
                  discounts and payment plans available.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className='py-20'>
          <div className='max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8'>
            <div className='bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-3xl p-12 border border-white/20'>
              <h2 className='text-4xl md:text-5xl font-bold text-white mb-6'>
                Ready to Transform Your Future?
              </h2>
              <p className='text-xl text-gray-300 mb-8'>
                Join thousands of learners who are already advancing their
                careers with SkillBridge courses.
              </p>

              <div className='flex flex-col sm:flex-row gap-6 justify-center items-center'>
                <Link
                  to='/signup'
                  className='px-10 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-bold rounded-full transform hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25'
                >
                  💎 Browse Courses Now
                </Link>

                <div className='text-gray-400 text-sm'>
                  Free account • No credit card required
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className='py-12 border-t border-white/10'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <div className='text-gray-400 text-sm'>
              &copy; {new Date().getFullYear()} SkillBridge. Empowering learners
              worldwide. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Welcome;
