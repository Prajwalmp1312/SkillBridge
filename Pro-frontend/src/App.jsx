import React from 'react';
// import { GiTechnoHeart } from "react-icons/gi";
import { Routes, Route } from "react-router-dom"
import Welcome from './pages/Welcome';
import Signupstd from './pages/Signupstd'
import Signuptutor from './pages/Signuptutor';
import Loginstd from './pages/Loginstd';
import Logintutor from './pages/Logintutor';
import Home from './pages/Home';


const App = () => {
  return (
    <Routes>
        <Route path="/" element={<Welcome/>}/>
        <Route path="/signupstd/student" element={<Signupstd/>}/>
        <Route path="/signuptutor/tutor" element={<Signuptutor/>}/>
        <Route path="/login/student" element={<Loginstd/>}/>
        <Route path="/login/tutor" element={<Logintutor/>}/>
        <Route path="/home" element={<Home/>}/>

        {/* <Route path="/dashboard" element={<Dashboard/>}/> */}
      </Routes>
  )
  
};

export default App;
