import { Routes, Route, Navigate } from 'react-router-dom';
import Signup from './pages/Signup';
import VerifyOTP from './pages/VerifyOTP';
import Notes from './pages/Notes';
import Login from './pages/Login'; 
import React from 'react';

function App() {
  return (
    <Routes>
      {/* This line redirects the user from the root path to the /signup page */}
      <Route path="/" element={<Navigate to="/signup" />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}

export default App;