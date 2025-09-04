import React, { useEffect, useState } from "react";

const LeaderBoardPage = () => {
    const [users, setUsers] = useState([]);
    const [loggedInUserId, setLoggedInUserId] = useState(null);

    const decodeJWT = (token) => {
        try {
            const base64Url = token.split(".")[1];
            const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(atob(base64));
        } catch (error) {
            console.error("Invalid JWT token", error);
            return null;
        }
    };

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/leaderBoard`); // Replace with your API URL
                const data = await response.json();
                setUsers(data);

                // Fetch JWT from localStorage
                const token = localStorage.getItem("jwtToken"); // Ensure your app stores the token here
                if (token) {
                    const decodedToken = decodeJWT(token);
                    const loggedInEmail = decodedToken?.email; // Extract user email from JWT

                    // Find the logged-in user's ID
                    const loggedInUser = data.find((user) => user.email === loggedInEmail);
                    if (loggedInUser) {
                        setLoggedInUserId(loggedInUser.id);
                    }
                }
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="flex justify-center items-center min-h-screen bg-white">
            <LeaderBoard users={users} loggedInUserId={loggedInUserId} />
        </div>
    );
};

export default LeaderBoardPage;

const LeaderBoard = ({ users, loggedInUserId }) => {
    return (
        <div className="w-full max-w-2xl mx-auto p-4 rounded-lg shadow-lg" style={{ backgroundColor: "#141414" }}>
            <h2 className="text-center text-3xl font-bold text-[#FFF700] mb-6">Leaderboard</h2>

            {/* Podium for Top 3 */}
            <div className="flex justify-center items-end space-x-2 sm:space-x-6">
                {users.slice(0, 3).map((user, index) => (
                    <div
                        key={user.id}
                        className={`flex flex-col items-center justify-end ${index === 0 ? "h-32" : index === 1 ? "h-28" : "h-24"
                            } w-20 sm:w-24 bg-[#FFD700] text-black font-bold rounded-lg shadow-md p-2`}
                    >
                        <span className="text-lg sm:text-xl">{user.name}</span>
                        <span className="text-sm sm:text-base">{user.score} pts</span>
                        <span className="text-2xl sm:text-3xl font-bold">{index + 1}</span>
                    </div>
                ))}
            </div>

            {/* Remaining Users List */}
            <ul className="mt-6 space-y-2">
                {users.slice(3).map((user, index) => (
                    <li
                        key={user.id}
                        className={`flex justify-between items-center p-2 rounded-md ${user.id === loggedInUserId ? "bg-[#6D2C91] text-white font-bold" : "bg-gray-800 text-white"
                            }`}
                    >
                        <span className="text-lg">{index + 4}. {user.name}</span>
                        <span className="text-lg">{user.score} pts</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};