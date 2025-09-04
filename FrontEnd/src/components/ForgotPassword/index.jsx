import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [otpPopup, setOtpPopup] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("Processing...");

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/send-otp`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            setMessage(data.message || "OTP has been sent to your email.");
            setTimeout(() => setOtpPopup(true), 1000); // Show OTP popup after success
        } catch (error) {
            setMessage("Error sending OTP. Please try again later.");
        }
    };

    if (otpPopup) {
        return <OTPVerification email={email} />;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-0 z-50 bg-cover bg-center" style={{ backgroundImage: "url('Home.png')" }}>
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="absolute inset-0 bg-cover bg-center filter blur-md" style={{ backgroundImage: "url('Home.png')" }}></div>
            <div className="bg-black bg-opacity-60 p-6 rounded-lg shadow-lg w-96 relative">
                <button
                    className="absolute top-2 right-2 bg-[#FFF700] text-black rounded-full px-3 py-1"
                    onClick={() => navigate("/auth")}
                >
                    ✕
                </button>
                <h2 className="text-2xl font-bold mb-4 text-center text-[#FFF700]">Forgot Password</h2>
                <p className="text-gray-600 mb-6 text-center">Enter your email to receive an OTP for password reset.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2 border border-[#FFF700] rounded-lg focus:ring-2 focus:ring-[#FFF700] focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="w-full bg-[#FFF700] text-black p-2 rounded-lg transition duration-300"
                    >
                        Send OTP
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-gray-800">{message}</p>}
            </div>
        </div>
    );
};

const OTPVerification = ({ email }) => {
    const [otp, setOtp] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleReset = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/change-pass`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, otp, password }),
            });

            const data = await response.json();
            setMessage(data.message || "Password successfully reset.");
        } catch (error) {
            setMessage("Error resetting password. Please try again later.");
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-0 z-50 bg-cover bg-center" style={{ backgroundImage: "url('Home.png')" }}>
            <div className="bg-black bg-opacity-60 p-6 rounded-lg shadow-lg w-96 relative">
                <h2 className="text-2xl font-bold mb-4 text-center text-[#FFF700]">Verify OTP</h2>
                <p className="text-gray-600 mb-6 text-center">Enter the OTP sent to your email along with your new password.</p>
                <form onSubmit={handleReset} className="space-y-4">
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="w-full p-2 border border-[#FFF700] rounded-lg focus:ring-2 focus:ring-[#FFF700] focus:outline-none"
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-2 border border-[#FFF700] rounded-lg focus:ring-2 focus:ring-[#FFF700] focus:outline-none"
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full p-2 border border-[#FFF700] rounded-lg focus:ring-2 focus:ring-[#FFF700] focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="w-full bg-[#FFF700] text-black p-2 rounded-lg transition duration-300"
                    >
                        Reset Password
                    </button>
                </form>
                {message && <p className="mt-4 text-center text-gray-800">{message}</p>}
            </div>
        </div>
    );
};

export default ForgotPassword;