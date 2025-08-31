import React, { useState } from 'react';
import API from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });
  const [step, setStep] = useState('signup'); // 'signup' or 'verify-otp'
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, password, otp } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // This handles both form submissions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (step === 'signup') {
      try {
        const res = await API.post('/auth/send-otp', { name, email, password });
        setMessage(res.data.msg);
        localStorage.setItem('tempToken', res.data.tempToken);
        setStep('verify-otp'); // Move to the next step
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Server error. Please try again later.');
      }
    } else { // step is 'verify-otp'
      try {
        const tempToken = localStorage.getItem('tempToken');
        if (!tempToken) {
          setError('Temporary token not found. Please try signing up again.');
          return;
        }

        const res = await API.post('/auth/verify-otp', { otp, tempToken });
        localStorage.setItem('token', res.data.token);
        setMessage(res.data.msg);
        navigate('/notes'); // Redirect on successful verification
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
          <img src="/icon.png" alt="HD Logo" />
          <h1>HD</h1>
        </div>

        <div className="content-wrapper">
          <h2 className="page-title">{step === 'signup' ? 'Sign up' : 'Verify OTP'}</h2>
          <p className="page-subtitle">{step === 'signup' ? 'Sign up to enjoy the feature of HD' : 'Enter the OTP sent to your email'}</p>
          
          {message && <p className="text-green-500 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <form onSubmit={handleSubmit} className="form-container">
            {step === 'signup' ? (
              <>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Your Name</label>
                  <input className="form-input" type="text" id="name" name="name" value={name} onChange={handleChange} placeholder="Jonas Khanwald" />
                </div>
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input className="form-input" type="email" id="email" name="email" value={email} onChange={handleChange} placeholder="jonas_kahnwald@gmail.com" />
                </div>
                <div className="form-group">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input className="form-input" type="password" id="password" name="password" value={password} onChange={handleChange} />
                </div>
                <button type="submit" className="primary-button">Get OTP</button>
              </>
            ) : (
              <>
                <div className="form-group">
                  <label htmlFor="otp" className="form-label">OTP</label>
                  <input className="form-input" type="text" id="otp" name="otp" value={otp} onChange={handleChange} />
                </div>
                <button type="submit" className="primary-button">Submit</button>
              </>
            )}
          </form>

          {step === 'signup' && (
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

export default AuthPage;