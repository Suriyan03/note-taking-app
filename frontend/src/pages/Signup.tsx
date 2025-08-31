import React, { useState } from 'react';
import API from '../services/authService';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });
  const [otpSent, setOtpSent] = useState(false); // Flag to show OTP input
  const [showOtp, setShowOtp] = useState(false); // Toggle OTP visibility
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, password, otp } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!otpSent) {
      // Send OTP first
      try {
        const res = await API.post('/auth/send-otp', { name, email, password });
        setMessage(res.data.msg);
        localStorage.setItem('tempToken', res.data.tempToken);
        setOtpSent(true); // show OTP input
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Server error. Please try again later.');
      }
    } else {
      // Verify OTP
      try {
        const tempToken = localStorage.getItem('tempToken');
        if (!tempToken) {
          setError('Temporary token not found. Please try signing up again.');
          return;
        }
        const res = await API.post('/auth/verify-otp', { otp, tempToken });
        localStorage.setItem('token', res.data.token);
        setMessage(res.data.msg);
        navigate('/notes'); // redirect to notes page
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Server error. Please try again later.');
      }
    }
  };

  return (
    <div className="container">
      {/* Left Panel - Form */}
      <div className="left-panel">
        <div className="brand">
          <img src="/images/logo.png" alt="HD Logo" />
          <h1>HD</h1>
        </div>

        <div className="content-wrapper">
          <h2 className="page-title">Sign up</h2>
          <p className="page-subtitle">Sign up to enjoy the feature of HD</p>

          {message && <p style={{ color: "green", fontSize: "14px" }}>{message}</p>}
          {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
              <label htmlFor="name" className="form-label">Your Name</label>
              <input className="form-input" type="text" id="name" name="name" value={name} onChange={handleChange} placeholder="Jonas Khanwald" disabled={otpSent} />
            </div>
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input className="form-input" type="email" id="email" name="email" value={email} onChange={handleChange} placeholder="jonas_kahnwald@gmail.com" disabled={otpSent} />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input className="form-input" type="password" id="password" name="password" value={password} onChange={handleChange} disabled={otpSent} />
            </div>

            {otpSent && (
  <div className="form-group" style={{ position: 'relative' }}>
    <label htmlFor="otp" className="form-label">OTP</label>
    <input
      className="form-input"
      type={showOtp ? 'text' : 'password'}
      id="otp"
      name="otp"
      value={otp}
      onChange={handleChange}
      placeholder="Enter OTP"
      style={{
        width: "20rem",
        paddingRight: '60px', // space for the toggle
      }}
    />
      <span
        onClick={() => setShowOtp(!showOtp)}
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#357aff',
          userSelect: 'none',
        }}
      >
      {showOtp ? 'Hide' : 'Show'}
    </span>
  </div>
)}


            <button type="submit" className="primary-button">
              {otpSent ? 'Submit OTP' : 'Get OTP'}
            </button>
          </form>

          {!otpSent && (
            <div style={{ textAlign: "center", fontSize: "14px", marginTop: "1rem" }}>
              <span style={{ color: "#6c6c6c" }}>Already have an account? </span>
              <span onClick={() => navigate('/login')} style={{ fontWeight: "600", color: "#357aff", textDecoration: "underline", cursor: "pointer" }}>
                Sign in
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Background Image */}
      <div
        className="right-panel"
        style={{ backgroundImage: "url('/images/bg.png')" }}
      />
    </div>
  );
};

export default SignUp;
