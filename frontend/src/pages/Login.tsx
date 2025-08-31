import React, { useState } from 'react';
import API from '../services/authService';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      
      // Save the JWT token
      localStorage.setItem('token', res.data.token);

      setMessage('Login successful!');
      setError('');
      
      // Redirect to the notes page
      navigate('/notes');
    } catch (err: any) {
      if (err.response) {
        setError(err.response.data.msg);
      } else {
        setError('Server error. Please try again later.');
      }
      setMessage('');
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
        
        <div>
          <div>
            <h2 className="page-title">Sign in</h2>
            <p className="page-subtitle">Sign in to enjoy the feature of HD</p>
          </div>

          <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input 
                className="form-input"
                type="email" 
                id="email" 
                name="email" 
                value={email} 
                onChange={handleChange} 
                placeholder="jonas_kahnwald@gmail.com" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input 
                className="form-input"
                type="password" 
                id="password" 
                name="password" 
                value={password} 
                onChange={handleChange} 
              />
            </div>

            {message && <p style={{ color: "green", fontSize: "14px" }}>{message}</p>}
            {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}

            <button type="submit" className="primary-button">
              Sign In
            </button>
          </form>

          <div style={{ textAlign: "center", fontSize: "14px", marginTop: "10px" }}>
            <span style={{ color: "#6c6c6c" }}>Don't have an account? </span>
            <span 
              onClick={() => navigate('/signup')} 
              style={{ fontWeight: "600", color: "#357aff", textDecoration: "underline", cursor: "pointer" }}
            >
              Sign up
            </span>
          </div>
        </div>
      </div>
      {/* Right Panel - Background Image */}
      <div 
        className="right-panel"
        style={{ backgroundImage: `url('/images/bg.png')` }}
      />
    </div>
  );
};

export default Login;