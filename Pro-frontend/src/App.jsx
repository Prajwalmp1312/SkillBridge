import React from 'react';
// import { GiTechnoHeart } from "react-icons/gi";
import { Routes, Route } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import './styles/snackbar.css';
import Welcome from './pages/Welcome';
// Unified authentication pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import TutorDashboard from './pages/TutorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import CoursePlayer from './pages/CoursePlayer';
// Admin pages
import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  return (
    <SnackbarProvider
      maxSnack={3}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      autoHideDuration={4000}
      dense
      preventDuplicate
    >
      <Routes>
        <Route
          path='/'
          element={<Welcome />}
        />

        {/* Unified authentication routes */}
        <Route
          path='/login'
          element={<Login />}
        />
        <Route
          path='/signup'
          element={<Signup />}
        />

        {/* Dashboard routes */}
        <Route
          path='/tutor-dashboard'
          element={<TutorDashboard />}
        />
        <Route
          path='/student-dashboard'
          element={<StudentDashboard />}
        />
        <Route
          path='/course/:courseId'
          element={<CoursePlayer />}
        />

        {/* Admin routes */}
        <Route
          path='/admin-login'
          element={<AdminLogin />}
        />
        <Route
          path='/admin-signup'
          element={<AdminSignup />}
        />
        <Route
          path='/admin-dashboard'
          element={<AdminDashboard />}
        />

        {/* <Route path="/dashboard" element={<Dashboard/>}/> */}
      </Routes>
    </SnackbarProvider>
  );
};

export default App;
