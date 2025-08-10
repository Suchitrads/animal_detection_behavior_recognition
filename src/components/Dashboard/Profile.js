import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ForgetPassword from "./ForgotPassword"; // Make sure to import your ForgetPassword component
import { jsPDF } from "jspdf";

const Profile = () => {
  const [user, setUser] = useState({});
  const [newAvatar, setNewAvatar] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [error, setError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser.user); // Assumes you're saving `user` inside `user` object.
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatar(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveAvatar = async () => {
    if (!newAvatar) {
      setError("Please select an avatar first.");
      return;
    }

    // Here, you'll upload the new avatar to the server (using a POST request to update profile).
    const formData = new FormData();
    formData.append("avatar", newAvatar);

    try {
      // Example request to your backend to upload avatar
      const response = await fetch("http://127.0.0.1:5000/update-avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Failed to update avatar");
      }

      setUser({ ...user, avatar: result.avatarUrl });
      setNewAvatar(null);
      setImagePreview(null);
      alert("Avatar updated successfully!");
    } catch (error) {
      setError("Error: " + error.message);
    }
  };

  const handleChangePassword = () => {
    setShowPasswordModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <div className="bg-white w-96 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold text-center">Profile</h2>
        <div className="mt-6">
          <div className="flex items-center justify-center">
            <img
              src={user.avatar || "https://via.placeholder.com/100"}
              alt="Profile Avatar"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>

          {/* Avatar Upload */}
          <div className="mt-4 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="border px-4 py-2 rounded"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
            )}
            <button
              onClick={handleSaveAvatar}
              className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save Avatar
            </button>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}

          {/* User Details */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold">User Details</h3>
            <p><strong>Name:</strong> {user.name || "N/A"}</p>
            <p><strong>Email:</strong> {user.email || "N/A"}</p>
            <p><strong>Username:</strong> {user.username || "N/A"}</p>
          </div>

          {/* Change Password */}
          <div className="mt-6 text-center">
            <button
              onClick={handleChangePassword}
              className="bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Change Password
            </button>
          </div>

          {/* Logout Button */}
          <div className="mt-4 text-center">
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold">Change Password</h2>
            <ForgetPassword /> {/* Import and display your ForgetPassword component */}
            <button
              onClick={() => setShowPasswordModal(false)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
