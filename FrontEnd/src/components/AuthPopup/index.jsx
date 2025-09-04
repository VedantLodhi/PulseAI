import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AuthPopup() {
  const navigate = useNavigate();
  const [type, setType] = useState("login");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    totalScore: 0,
    daily_challenge: "No Challenges available",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const baseUrl = import.meta.env.VITE_API_URL;
    const url = type === "signup" ? `${baseUrl}/register` : `${baseUrl}/token`;

    try {
      const formDataToSend = new URLSearchParams();
      formDataToSend.append("username", formData.email);
      formDataToSend.append("password", formData.password);
      console.log(formDataToSend);

      const response = await fetch(url, {
        method: "POST",
        headers:
          type === "signup"
            ? { "Content-Type": "application/json" }
            : { "Content-Type": "application/x-www-form-urlencoded" },
        body: type === "signup" ? JSON.stringify(formData) : formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong");
      }

      const result = await response.json();

      if (type !== "signup") {
        localStorage.setItem("token", result.access_token);
        localStorage.setItem("isUserLoggedIn", JSON.stringify(true));
        navigate("/");
      } else {
        alert(result.message);
        setType("login"); // Switch to login after signup
      }
    } catch (error) {
      console.error("Error submitting form:", error.message);
      alert(error.message);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-opacity-0 z-50 bg-cover bg-center"
      style={{ backgroundImage: "url('Home.png')" }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-md"
        style={{ backgroundImage: "url('Home.png')" }}
      ></div>
      <div className="bg-black bg-opacity-60 p-6 rounded-lg shadow-lg w-96 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-2 right-2 bg-[#FFF700] text-black rounded-full px-3 py-1"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center text-[#FFF700]">
          {type === "signup" ? "Create an Account" : "Welcome Back"}
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 border border-[#FFF700] rounded-lg focus:ring-2 focus:ring-[#FFF700] focus:outline-none"
            required
            value={formData.email}
            onChange={handleChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="w-full p-3 border border-[#FFF700] rounded-lg focus:ring-2 focus:ring-[#FFF700] focus:outline-none"
            required
            value={formData.password}
            onChange={handleChange}
          />
          {type === "signup" && (
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="w-full p-3 border border-[#FFF700] rounded-lg focus:ring-2 focus:ring-[#FFF700] focus:outline-none"
              required
              value={formData.username}
              onChange={handleChange}
            />
          )}
          <button
            type="submit"
            className="w-full bg-[#FFF700] text-black p-3 rounded-lg transition duration-300"
          >
            {type === "signup" ? "Sign Up" : "Login"}
          </button>
        </form>
        <div className="flex justify-between items-center mt-4">
          {type === "login" && (
            <p>
              <button
                className="text-[#FFF700] hover:underline"
                onClick={() => navigate("/forgotpassword")}
              >
                Forgot Password?
              </button>
            </p>
          )}
          <p className="text-center text-white">
            {type === "signup"
              ? "Already have an account?"
              : "Don't have an account?"}
            <button
              className="text-[#FFF700] hover:underline ml-2"
              onClick={() => setType(type === "signup" ? "login" : "signup")}
            >
              {type === "signup" ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPopup;
