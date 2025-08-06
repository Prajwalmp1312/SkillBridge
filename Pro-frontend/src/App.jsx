import React from 'react';
// import { GiTechnoHeart } from "react-icons/gi";
import { Routes, Route } from "react-router-dom"
import Welcome from '../pages/Welcome';
import Signup from '../pages/signup';

const App = () => {
  return (
    <Routes>
        <Route path="/" element={<Welcome/>}/>
        <Route path="/signup" element={<Signup/>}/>
        {/* <Route path="/signin" element={<Signin/>}/> */}
        {/* <Route path="/dashboard" element={<Dashboard/>}/> */}
      </Routes>
  )
  
};

export default App;
