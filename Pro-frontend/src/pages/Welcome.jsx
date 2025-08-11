import React from 'react'
import { Link, useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  const handleSignupChange = (e) => {
    const value = e.target.value;
    if (value === "Tutor") navigate("/signuptutor/tutor");
    if (value === "Student") navigate("/signupstd/student");
  };
  const handleLoginChange = (e) => {
    const value = e.target.value;
    if (value === "Student") navigate("/login/student");
    if (value === "Tutor") navigate("/login/tutor");
  };
  return (
    <>
      <div className='h-10 flex space-x-160 place-items-center justify-items-center'>
        <div className='w-2/4'></div>
        <div className='flex w-full justify-evenly'>
          <div>
            <label htmlFor="Signup">Signup:
              <select name="Signup" id="Signup" onChange={handleSignupChange} defaultValue="">
                <option value="" disabled>Select</option>
                <option value="Tutor">Tutor</option>
                <option value="Student">Student</option>
              </select>
            </label>
          </div>
          <div>
            <label htmlFor="signin">Login:
              <select name="signin" id="signin" onChange={handleLoginChange} defaultValue="">
                <option value="" disabled>Select</option>
                <option value="Tutor">Tutor</option>
                <option value="Student">Student</option>
              </select>
            </label>
          </div>
        </div>
      </div>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-500 via-sky-400 to-pink-700">
        <div className="bg-white/10 backdrop-blur rounded-xl shadow-lg p-8 flex flex-col items-center">
          <div className="mb-4">
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" className="mx-auto mb-2">
              <rect width="24" height="24" rx="12" fill="#6366F1" />
              <path d="M7 17V7h10v10H7zm2-2h6V9H9v6z" fill="#fff"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to SkillBridge</h1>
          <p className="text-gray-300 text-lg mb-6 text-center max-w-md">
            From nothing to everything<br />
            Start building your learning journey!
          </p>
          <Link
            to="/signupstd/student"
            className="px-4 py-2 bg-blue-700 text-indigo-100 rounded-full text-sm font-mono mb-2 hover:bg-blue-800 transition"
          >
            Go to Signup Page
          </Link>
          <span className="text-xs text-white-400">Empowering Students & Tutors</span>
        </div>
        <footer className="mt-10 text-white-500 text-xs">
          &copy; {new Date().getFullYear()} SkillBridge
        </footer>
      </div>
    </>
  );
}

export default Welcome
