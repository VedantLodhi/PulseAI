import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Settings() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user email from local storage
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    setEmail(storedUser.email || "");
  }, []);

  const handleUpdateProfile = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/update-pass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ email, newPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.detail || "Failed to update password");
      }

      // Update local storage (optional)
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, password: newPassword })
      );

      alert("Password updated successfully!");
    } catch (error) {
      console.error("Error updating password:", error.message);
      alert(error.message);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('Home.png')" }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-md"
        style={{ backgroundImage: "url('Home.png')" }}
      ></div>

      {/* Main Content */}
      <div className="relative z-10 text-white text-center w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-[#FFF700]">Update Profile</h2>

        <div className="bg-black bg-opacity-60 p-6 rounded-xl shadow-lg w-full">
          {/* Email Field */}
          <label className="block text-lg mb-2 text-[#FFF700]">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full p-2 mb-4 bg-gray-800 text-gray-400 rounded border border-[#FFF700]"
          />

          {/* New Password Field */}
          <label className="block text-lg mb-2 text-[#FFF700]">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-2 mb-4 bg-gray-800 text-white rounded border border-[#FFF700]"
          />

          {/* Confirm Password Field */}
          <label className="block text-lg mb-2 text-[#FFF700]">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-2 mb-4 bg-gray-800 text-white rounded border border-[#FFF700]"
          />

          {/* Update Password Button */}
          <button
            onClick={handleUpdateProfile}
            className="w-full bg-[#FFF700] text-black font-bold py-2 rounded-lg hover:bg-yellow-400 transition"
          >
            Update Password
          </button>
        </div>

        {/* Back to Home Button */}
        <button
          onClick={() => navigate("/")}
          className="mt-4 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Settings;