import { useEffect, useRef, useState } from "react"
import Webcam from "react-webcam"

const WEBSOCKET_URL = "ws://localhost:8000/ws/workout"

const WorkoutTracker = () => {
  const [accuracy, setAccuracy] = useState(0)
  const [frameNo, setFrameNo] = useState(1)
  const socketRef = useRef(null)
  const webcamRef = useRef(null)

  useEffect(() => {
    // WebSocket logic remains unchanged
    socketRef.current = new WebSocket(WEBSOCKET_URL)

    socketRef.current.onopen = () => {
      console.log("WebSocket connection established.")
    }

    socketRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data)
      if (data.accuracy) setStatus(data.accuracy)
    }

    socketRef.current.onclose = () => {
      console.log("WebSocket connection closed.")
    }

    socketRef.current.onerror = (error) => {
      console.error("WebSocket error: ", error)
    }

    const sendFrames = () => {
      if (!webcamRef.current) return
      const imageSrc = webcamRef.current.getScreenshot()

      if (imageSrc && socketRef.current.readyState === WebSocket.OPEN) {
        const base64data = imageSrc.split(",")[1]
        socketRef.current.send(JSON.stringify({
          frame: base64data,
          frame_No: frameNo
        }))
        setFrameNo(frameNo + 1)
      }
    }

    const frameInterval = setInterval(sendFrames, 100)

    return () => {
      clearInterval(frameInterval)
      socketRef.current?.close()
    }
  }, [])

  return (
    <div className="flex justify-center items-center min-h-screen p-2 sm:p-5 bg-black">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 w-full rounded-2xl shadow-2xl border border-white/40">
        {/* Webcam Feed */}
        <div className="flex-1 text-center">
          <h2 className="mb-2 lg:mb-4 text-xl lg:text-2xl font-bold text-[#FFD700] tracking-wide">Workout Tracker</h2>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            width="100%"
            videoConstraints={{
              facingMode: "user",
            }}
            className="w-full h-[300px] lg:h-[700px] rounded-xl border-4 border-[#FFD700] shadow-lg transition-all duration-300 hover:border-white"
          />
        </div>

        {/* Follow Along Video */}
        <div className="flex-1 text-center">
          <h2 className="mb-2 lg:mb-4 text-xl lg:text-2xl font-bold text-[#FFD700] tracking-wide">Follow Along</h2>
          <iframe
            width="100%"
            height="300"
            src="https://www.youtube.com/embed/LJwupStv_jE"
            title="Workout Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-[300px] lg:h-[700px] rounded-xl border-4 border-[#FFD700] shadow-lg transition-all duration-300 hover:border-white"
          />
        </div>
      </div>
    </div>
  )
}

export default WorkoutTracker;