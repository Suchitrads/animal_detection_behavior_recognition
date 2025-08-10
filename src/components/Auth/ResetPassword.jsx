import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [passwordStrength, setPasswordStrength] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const checkPasswordStrength = (password) => {
    const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const medium = /^((?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,})$/;

    if (strong.test(password)) setPasswordStrength('Strong');
    else if (medium.test(password)) setPasswordStrength('Medium');
    else setPasswordStrength('Weak');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'newPassword') checkPasswordStrength(value);

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { email, newPassword, confirmPassword } = formData;

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password-direct', {
        email,
        newPassword,
        confirmPassword,
      });

      setMessage(res.data.msg);
      setError('');

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/signin'); // or '/login'
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to reset password.');
      setMessage('');
    }
  };

  return (
      <div
        className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center px-4 relative"
        style={{ backgroundImage: "url('/images/wildlife-1.jpg')" }}
      >
      <form
        onSubmit={handleSubmit}
        className="bg-white/30 backdrop-blur-md p-8 rounded-lg shadow-xl max-w-md w-full z-10 relative"
      >
        <h2 className="text-2xl text-gray-600 font-bold mb-6 text-center">Reset Password</h2>

        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
          {formData.newPassword && (
            <span
              className={`text-sm font-semibold mt-1 block ${
                passwordStrength === 'Strong'
                  ? 'text-green-600'
                  : passwordStrength === 'Medium'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}
            >
              Password Strength: {passwordStrength}
            </span>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 mb-1">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-black/60 text-white py-2 rounded hover:bg-black/80 transition"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
