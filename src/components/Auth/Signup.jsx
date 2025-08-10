import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState('');


  const navigate = useNavigate();

 const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === 'password') {
    checkPasswordStrength(value);
  }

  setFormData({
    ...formData,
    [name]: value,
  });
};


  const checkPasswordStrength = (password) => {
  let strength = '';

  const strong = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
  const medium = /^((?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,})$/;

  if (strong.test(password)) {
    strength = 'Strong';
  } else if (medium.test(password)) {
    strength = 'Medium';
  } else {
    strength = 'Weak';
  }

  setPasswordStrength(strength);
};


  const handleSubmit = async (e) => {
  e.preventDefault();

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (formData.password !== formData.confirmPassword) {
    setErrorMessage('Passwords do not match.');
    return;
  }

  if (!strongPasswordRegex.test(formData.password)) {
    setErrorMessage(
      'Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.'
    );
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    });

    setErrorMessage(null);
    setShowSuccessModal(true);

    setTimeout(() => {
      setShowSuccessModal(false);
      navigate('/signin');
    }, 2000);
  } catch (error) {
    console.error(error);
    setErrorMessage(error.response?.data?.msg || 'Registration failed. Please try again.');
  }
};


  return (
    <div
        className="min-h-screen bg-cover bg-center flex items-center justify-center px-4 relative"
        style={{ backgroundImage: "url('/images/wildlife-1.jpg')" }} // Replace with actual image path
      >
        {/* Success Modal remains unchanged */}
        {showSuccessModal && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-fade-in">
              <h2 className="text-xl font-bold text-green-600">Registration Successful!</h2>
              <p className="text-gray-700 mt-2">Redirecting to login...</p>
            </div>
          </div>
        )}

        {/* Updated Form Card with transparency */}
        <div className="bg-white/30 backdrop-blur-md p-8 rounded-lg shadow-xl max-w-md w-full z-10 relative">
          <h2 className="text-2xl font-bold mb-6 text-center text-white">Create Account</h2>

          {/* Error message styling unchanged */}
          {errorMessage && (
            <div className="mb-4 p-4 rounded-md bg-red-100 border border-red-400 text-red-700 relative animate-shake">
              <strong className="block mb-1">⚠️ Error:</strong>
              {errorMessage}
              <button
                onClick={() => setErrorMessage(null)}
                className="absolute top-1 right-2 text-red-500 hover:text-red-700 text-xl"
              >
                &times;
              </button>
            </div>
          )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Username</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {/* 👇 Add this span below the input */}
            {formData.password && (
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
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
           className="w-full bg-black/60 text-white py-2 rounded hover:bg-black/80 transition"

          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default Signup;
