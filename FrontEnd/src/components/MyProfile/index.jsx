import { useState, useEffect } from "react";

const MyProfile = () => {
  const [username, setUsername] = useState("User");
  const [historyType, setHistoryType] = useState("week");
  const [trackerType, setTrackerType] = useState("plank");
  const [historyData, setHistoryData] = useState([]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser?.username) {
      setUsername(storedUser.username);
    }

    fetchHistoryData();
  }, [historyType, trackerType]);

  const fetchHistoryData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userEmail = storedUser?.email;

      if (!userEmail) {
        console.error("User email not found in localStorage");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/user-history`,
       { method: "GET" , 
        headers:{"Content-type": "application/json"},
        body: JSON.stringify({ "email":userEmail })
    });

      if (!response.ok) {
        throw new Error("Failed to fetch history data");
      }

      const data = await response.json();
      setHistoryData(data);
    } catch (error) {
      console.error("Error fetching history:", error);
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
      <div className="relative z-10 text-white text-center w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-[#FFF700]">Hi, {username}!</h1>

        {/* Selection Options */}
        <div className="bg-black bg-opacity-60 p-8 rounded-xl shadow-lg justify-between mb-6">
          <h2 className="text-2xl font-semibold mb-6 text-[#FFF700]">Workout History</h2>

          <div className="flex justify-between mb-6 space-x-4">
            {/* History Type Selection */}
            <select
              className="p-3 w-1/2 rounded bg-gray-800 text-white border border-[#FFF700]"
              value={historyType}
              onChange={(e) => setHistoryType(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="15days">Last 15 Days</option>
            </select>

            {/* Tracker Type Selection */}
            <select
              className="p-3 w-1/2 rounded bg-gray-800 text-white border border-[#FFF700]"
              value={trackerType}
              onChange={(e) => setTrackerType(e.target.value)}
            >
              <option value="plank">Plank Tracker</option>
              <option value="squats">Squats Tracker</option>
              <option value="pushup">Push-Up Tracker</option>
              <option value="workout">Workout Tracker</option>
            </select>
          </div>

          {/* Enlarged History Display Box */}
          <div className="bg-gray-800 p-6 rounded-lg h-80 overflow-auto">
            {historyData.length > 0 ? (
              <ul>
                {historyData.map((item, index) => (
                  <li key={index} className="border-b border-gray-700 py-3">
                    <span className="font-bold text-[#FFF700]">{item.exercise_name}</span> - {item.date}:  
                    <span className="text-yellow-300">
                      {trackerType === "plank" ? `${item.currep} seconds` : `${item.currep} reps`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-lg">No history available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;