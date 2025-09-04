import { useState, useRef, useEffect } from "react"
import Webcam from "react-webcam"

const WEBSOCKET_URL = "ws://localhost:8000/ws"

function PlankTracker() {
  const [frameNo, setFrameNo] = useState(1);
  const [feedback, setFeedback] = useState({
    plank: false,
    angle: 0,
    time_held: 0,
    plank_message: "",
  })
  const [isConnected, setIsConnected] = useState(false)
  const websocketRef = useRef(null)
  const webcamRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    const socket = new WebSocket(WEBSOCKET_URL)
    websocketRef.current = socket

    socket.onopen = () => {
      setIsConnected(true)
      console.log("Connected to WebSocket")
    }

    socket.onclose = () => {
      setIsConnected(false)
      console.log("Disconnected from WebSocket")
    }

    socket.onerror = (error) => {
      console.error("WebSocket Error:", error)
    }

    socket.onmessage = (event) => {
      const response = JSON.parse(event.data)
      console.log("Received response:", response)

      if (response) {
        setFeedback(response)
      }
    }

    return () => {
      socket.close()
    }
  }, [])

  const sendFrame = () => {
    if (websocketRef.current?.readyState === WebSocket.OPEN && webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot()
      if (imageSrc) {
        websocketRef.current.send(
          JSON.stringify({
            frame: imageSrc.split(",")[1],
            frame_No: frameNo,
          }),
        )
        setFrameNo(frameNo + 1);
      }
    }
  }

  useEffect(() => {
    if (isConnected && !intervalRef.current) {
      intervalRef.current = setInterval(sendFrame, 100)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [isConnected]) // Removed sendFrame from dependencies

  const { angle = 0, plank = false, time_held = 0, plank_message = "" } = feedback

  const circumference = 2 * Math.PI * 50
  const strokeOffset = circumference - (angle / 360) * circumference

  const ringColor = plank ? "#28a745" : "#dc3545"

  return (
    <div className="flex flex-col lg:flex-row min-h-screen p-2 lg:p-5 bg-black">
      {/* Left Side: Heading and Webcam */}
      <div className="flex flex-col items-start justify-start w-full lg:w-2/3 p-2 lg:p-6 rounded-2xl shadow-2xl">
        <h2 className="text-3xl lg:text-6xl xl:text-[80px] font-bold text-[#FFD700] tracking-wide mb-4">
          Plank Exercise Tracker
        </h2>
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width="100%"
          videoConstraints={{ facingMode: "user" }}
          className="w-full h-[300px] lg:h-[600px] rounded-xl border-4 border-[#FFD700] shadow-lg transition-all duration-300 hover:border-white"
        />
      </div>

      {/* Right Side: Feedback Results */}
      <div className="flex-1 p-2 lg:p-6 mt-4 lg:mt-0 rounded-2xl shadow-2xl border border-white/50">
        {/* WebSocket Connection Status */}
        <p
          className={`mt-2 lg:mt-4 text-base lg:text-lg font-semibold ${isConnected ? "text-[#FFD700]" : "text-white"}`}
        >
          {isConnected ? "Connected to Server ✅" : "Connecting to Server... ⏳"}
        </p>

        <h2 className="text-[#FFD700] text-3xl lg:text-5xl font-bold uppercase mt-4">Status</h2>
        <p>
          <span className="text-xl lg:text-2xl text-[#FFD700] font-semibold">Plank Status: </span>
          <span className={`${plank ? "text-[#FFD700]" : "text-white"} text-2xl lg:text-3xl font-semibold`}>
            {plank ? "Correct ✅" : "Incorrect ❌"}
          </span>
        </p>

        {/* Circular Angle Representation */}
        <span className="text-xl lg:text-2xl text-[#FFD700] font-semibold">Angle: </span>
        <span className="flex justify-center items-center mt-2 lg:mt-4 relative">
          <svg width="100" height="100" className="transform rotate-90">
            <circle cx="50" cy="50" r="40" stroke="#444" strokeWidth="8" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke={ringColor}
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference * 0.8}
              strokeDashoffset={strokeOffset * 0.8}
              className="transition-all duration-300"
            />
          </svg>
          <span className="absolute text-white text-2xl lg:text-3xl font-bold">{angle}°</span>
        </span>

        <p>
          <span className="text-xl lg:text-2xl text-[#FFD700] font-semibold">Time Held: </span>
          <span className="text-2xl lg:text-3xl text-[#FFFFFF] font-semibold"> {time_held} sec</span>
        </p>
        <p>
          <span className="text-xl lg:text-2xl text-[#FFD700] font-semibold">Message: </span>
          <span className="text-xl lg:text-3xl text-[#FFFFFF] font-semibold"> {plank_message}</span>
        </p>
      </div>
    </div>
  )
}

export default PlankTracker;