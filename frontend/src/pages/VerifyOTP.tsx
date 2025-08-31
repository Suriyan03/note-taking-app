import React, { useState } from 'react';
import API from '../services/authService';
import { useNavigate } from 'react-router-dom';

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtp(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Retrieve the temporary token from local storage
      const tempToken = localStorage.getItem('tempToken');
      if (!tempToken) {
        setError('Temporary token not found. Please try signing up again.');
        return;
      }

      const res = await API.post('/auth/verify-otp', { otp, tempToken });
      
      // Save the final JWT token
      localStorage.setItem('token', res.data.token);
      
      setMessage(res.data.msg);
      setError('');

      // Redirect to the notes page or a welcome page
      navigate('/notes');
    } catch (err) {
      setError(err.response.data.msg);
      setMessage('');
    }
  };

  return (
    <div>
      <h2>Verify OTP</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="otp">Enter OTP:</label>
          <input type="text" id="otp" name="otp" value={otp} onChange={handleChange} />
        </div>
        <button type="submit">Verify & Sign Up</button>
      </form>
    </div>
  );
};

export default VerifyOTP;