import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, User, X } from "lucide-react"
import { Dumbbell, CalendarCheck, Trophy, Users, Settings, LogOut, UserCircle, Accessibility, HandMetal, Activity } from "lucide-react";

function Home() {
  const [challenge, setChallenge] = useState("")
  const [reps, setReps] = useState(0)
  const [points, setPoints] = useState(0)
  const [showBanner, setShowBanner] = useState(true)
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()
  const [isLargeScreen, setIsLargeScreen] = useState(window.matchMedia("(min-width: 1024px)").matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleResize = () => setIsLargeScreen(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleResize);
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  const style = {
    background: isLargeScreen
      ? "linear-gradient(to left, rgba(0, 0, 0, 0.8) 10%, rgba(0, 0, 0, 0.2) 90%, rgba(0, 0, 0, 0) 100%)"
      : "black",
  };

  useEffect(() => {
    const userStatus = localStorage.getItem("isUserLoggedIn")
    setIsUserLoggedIn(userStatus === "true")
  }, [])

  const handleProfileClick = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    setIsProfileOpen(!isProfileOpen);
  }

  const toggleMenu = () => {
    if (isProfileOpen) {
      setIsProfileOpen(false);
    }
    setIsMenuOpen(!isMenuOpen);
  }

  const menuVariants = {
    closed: {
      x: "100%",
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
    open: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
      },
    },
  }

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/send-challenge`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Data received:", data)
        setChallenge(data.name)
        setReps(data.reps)
        setPoints(data.points)

        setTimeout(() => {
          setShowBanner(false)
        }, 30000)
      })
      .catch((error) => console.error("Error fetching data:", error))
  }, [])

  const handleBannerClick = () => {
    navigate("/dailychallenge")
  }
  console.log(import.meta.env.VITE_API_URL)
  return (
    <div className="flex flex-col scroll-smooth">
      {/* Slide 1 - Existing Home Page */}
      <div
        className="min-h-screen flex flex-col relative overflow-hidden text-white bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: "url('Home.png')" }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Header with Logo and New Buttons */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 sm:p-6 z-30 bg-transparent">
          <div className="flex items-center">
            <img src="Logo.png" alt="Hi-Fit Logo" className="h-8 sm:h-12 w-auto mr-2 sm:mr-4" />
            <h1 className="text-2xl sm:text-[40px] font-bold text-[#FFF700]">Hi-Fit</h1>
          </div>
          {isUserLoggedIn && (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleProfileClick}
                className="text-white hover:text-[#FFF700] transition-colors duration-200 focus:outline-none"
              >
                {isProfileOpen ? <X className="h-6 w-6 text-[#FFF700]" /> : <User className="h-6 w-6" />}
              </button>
              <button
                onClick={toggleMenu}
                className="text-white hover:text-[#FFF700] transition-colors duration-200 focus:outline-none"
              >
                {isMenuOpen ? <X className="h-6 w-6 text-[#FFF700]" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          )}
        </div>

        {/* Menu Overlay */}
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              className="absolute right-0 w-64 h-full p-6 overflow-y-auto z-20 shadow-6xl"
              style={style}
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <nav className="flex flex-col items-start space-y-6 mt-16">
                <Link
                  to="/profile"
                  className="flex items-center space-x-3 text-white text-lg transition-all duration-300 hover:text-[#FFF700] hover:scale-105"
                >
                  <UserCircle className="h-6 w-6 text-[#FFF700]" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center space-x-3 text-white text-lg transition-all duration-300 hover:text-[#FFF700] hover:scale-105"
                >
                  <Settings className="h-6 w-6 text-[#FFF700]" />
                  <span>Settings</span>
                </Link>

                <button className="flex items-center space-x-3 text-white text-lg transition-all duration-300 hover:text-[#FFF700] hover:scale-105" onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}>
                  <LogOut className="h-6 w-6 text-[#FFF700]" />
                  <span>Sign Out</span>
                </button>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="absolute right-0 w-64 h-full p-6 overflow-y-auto z-20 shadow-6xl"
              style={style}
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
            >
              <nav className="flex flex-col items-start space-y-6 mt-16">
                <Link
                  to="/planktracker"
                  className="flex items-center space-x-3 text-white text-lg transition-all duration-300 hover:text-[#FFF700] hover:scale-105"
                >
                  <Accessibility className="h-6 w-6 text-[#FFF700]" />
                  <span>Plank Tracker</span>
                </Link>
                <Link
                  to="/pushuptracker"
                  className="flex items-center space-x-3 text-white text-lg transition-all duration-300 hover:text-[#FFF700] hover:scale-105"
                >
                  <HandMetal className="h-6 w-6 text-[#FFF700]" />
                  <span>Push-up Tracker</span>
                </Link>
                <Link
                  to="/squattracker"
                  className="flex items-center space-x-3 text-white text-lg transition-all duration-300 hover:text-[#FFF700] hover:scale-105"
                >
                  <Activity className="h-6 w-6 text-[#FFF700]" />
                  <span>Squat Tracker</span>
                </Link>

                <Link
                  to="/leaderboard"
                  className="flex items-center space-x-3 text-white text-lg transition-all duration-300 hover:text-[#FFF700] hover:scale-105"
                >
                  <Trophy className="h-6 w-6 text-[#FFF700]" />
                  <span>LeaderBoard</span>
                </Link>

                <Link
                  to="/community"
                  className="flex items-center space-x-3 text-white text-lg transition-all duration-300 hover:text-[#FFF700] hover:scale-105"
                >
                  <Users className="h-6 w-6 text-[#FFF700]" />
                  <span>Community Post</span>
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="relative flex flex-col items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md"
          >
            <h1 className="flex flex-col justify-center text-4xl sm:text-6xl md:text-[100px] font-bold uppercase italic">
              Be Your <span className="text-[#FFF700]">Best</span>
            </h1>

            {isUserLoggedIn ? (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center mt-4">
                <Link
                  to="/dailychallenge"
                  className="flex bg-[#FFF700] text-black px-4 sm:px-6 py-2 rounded-lg shadow-md font-bold text-sm sm:text-base"
                >
                  <CalendarCheck className="h-6 w-6" />
                  <span>Daily Challenge</span>
                </Link>

                <Link
                  to="/workouttracker"
                  className="flex bg-white text-black px-4 sm:px-6 py-2 rounded-lg shadow-md font-bold text-sm sm:text-base"
                >
                  <Dumbbell className="h-6 w-6" />
                  <span>Workout Tracker</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center mt-4">
                <Link
                  to="/auth"
                  className="bg-white text-black px-4 sm:px-6 py-2 rounded-lg shadow-md font-bold text-sm sm:text-base"
                >
                  Get Started
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Slide 2 - Content from PPT */}
      <div
        className="min-h-screen flex flex-col md:flex-row items-center justify-between text-white p-6 sm:p-10"
        style={{ backgroundColor: "#141414" }}
      >
        {/* Left Side Content */}
        <div className="flex flex-col w-full md:w-1/2 mb-8 md:mb-0">
          <h2 className="text-3xl sm:text-4xl md:text-[50px] font-bold text-[#FFF700] italic mb-4">
            ABOUT OUR FIT FAMILY
          </h2>

          <p className="text-lg sm:text-xl md:text-[25px] max-w-2xl mb-6">
            Stay on top of your fitness goals with our advanced tracking system.
            {isExpanded && (
              <span>
                We offer a variety of features to help you maintain your fitness routine, including workout tracking,
                goal setting, and more. HiFit was founded in 2025 by two friends, Chirag and Sachman Singh. Our team is
                dedicated to constantly improving our service to ensure the best experience for all users. We believe in
                empowering individuals to achieve their fitness goals through data-driven insights and personalized
                challenges.
              </span>
            )}
          </p>

          <a
            className="mt-4 text-white underline cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show Less" : "Learn More"}
          </a>
        </div>

        {/* Right Side Images */}
        <div className="relative w-full md:w-1/2 h-64 md:h-full">
          <img
            src="About1.png"
            alt="Image 1"
            className="absolute top-0 left-0 md:top-[-150px] w-1/2 h-auto object-cover transition-all duration-300 hover:scale-105 hover:z-10"
          />
          <img
            src="About2.png"
            alt="Image 2"
            className="absolute bottom-0 right-0 md:top-[-250px] w-1/2 h-auto object-cover transition-all duration-300 hover:scale-105 hover:z-10"
          />
        </div>
      </div>

      {/* Slide 3 */}
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-10"
        style={{ backgroundColor: "#141414" }}
      >
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-3xl sm:text-4xl md:text-[50px] font-bold text-[#FFF700] italic text-center">
            WHAT WE OFFER
          </h2>
          <p className="text-lg sm:text-xl md:text-[25px] mt-4 text-white text-center">
            We're committed to bringing you the best workout experience.
          </p>
        </div>

        {/* Images with text */}
        <div className="flex flex-wrap justify-between w-full mt-8">
          <div className="relative w-full md:w-1/3 h-64 mb-4 md:mb-0">
            <img src="Offer1.png" alt="Image 1" className="w-full h-full object-cover" />
            <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl sm:text-2xl md:text-[25px] text-white font-semibold text-center">
              Perfect positioning
            </p>
          </div>
          <div className="relative w-full md:w-1/3 h-64 mb-4 md:mb-0">
            <img src="Offer2.png" alt="Image 2" className="w-full h-full object-cover" />
            <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl sm:text-2xl md:text-[25px] text-white font-semibold text-center">
              Keep your body fit by daily challenges and scores
            </p>
          </div>
          <div className="relative w-full md:w-1/3 h-64">
            <img src="Offer3.png" alt="Image 3" className="w-full h-full object-cover" />
            <p className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xl sm:text-2xl md:text-[25px] text-white font-semibold text-center">
              Ask about Personal Training
            </p>
          </div>
        </div>
      </div>

      {/* Slide 4 */}
      <div
        className="min-h-screen flex flex-col items-center justify-center text-white p-6 sm:p-10"
        style={{ backgroundImage: 'url("quote.png")', backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <h2 className="text-3xl sm:text-5xl md:text-[80px] font-bold text-[#FFF700] text-center">
          GET IN TOUCH TODAY
        </h2>
      </div>

      {/* Footer Section */}
      <footer className="bg-[#FFF700] text-black p-4 text-center">
        <p className="text-base sm:text-lg">Email Address</p>
        <p className="text-base sm:text-lg font-semibold">hiFitn3ss@gmail.com</p>
      </footer>

      {/* Banner - Only show if showBanner is true */}
      {showBanner && (
        <div
          onClick={handleBannerClick}
          className="fixed flex flex-col lg:flex-row top-12 left-1/2 transform -translate-x-1/2 bg-[#FFF700] text-black text-lg lg:text-2xl font-bold py-2 px-4 rounded-lg shadow-lg transition-all duration-500 opacity-100 scale-100 animate-fadeIn cursor-pointer"
        >
          <span>🏆 Challenge: {challenge || "NA"}</span>
          <span>🔄 Reps: {reps}</span>
          <span>🎯 Points: {points}</span>
        </div>
      )}
    </div>
  )
}

export default Home;