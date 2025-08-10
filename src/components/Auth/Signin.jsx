import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Signin = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (res.status === 200) {
        const userData = res.data;
        localStorage.setItem("user", JSON.stringify(userData));
        if (userData.token) {
          localStorage.setItem("token", userData.token);
        }

        setErrorMessage(null);
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Login error:", error.response?.data);
      setShowSuccessModal(false);
      setErrorMessage(error.response?.data?.msg || "Signin failed. Try again.");
    }
  };

  return (
        <div
      className="min-h-screen bg-cover bg-center flex flex-col items-center justify-center px-4 relative"
      style={{ backgroundImage: "url('/images/wildlife-1.jpg')" }}
    >  
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center animate-fade-in">
            <h2 className="text-xl font-bold text-green-600">Login Successful!</h2>
            <p className="text-gray-700 mt-2">Redirecting to dashboard...</p>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="bg-white/30 backdrop-blur-md p-8 rounded-lg shadow-xl max-w-md w-full z-10 relative">
        <h2 className="text-gray-600 font-bold mb-6 text-center">Sign In</h2>

        {/* Error Message */}
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
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black/60 text-white py-2 rounded hover:bg-black/80 transition"
          >
            Sign In
          </button>
        </form>

        <p className="text-center mt-4">
        <Link to="/reset-password" className="text-slate-200 hover:text-white underline">
          Forgot Password?
        </Link>
        </p>
        <p className="text-gray-600 text-center mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-slate-200 hover:text-white underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signin;
