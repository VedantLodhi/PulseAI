import cv2
import numpy as np
import json
import base64
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.services.exercise_tracker import ExerciseTracker

router = APIRouter()
exercise_inst = ExerciseTracker()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected")

    try:
        while True:
            try:
                
                # Receive the data from the client
                data = await websocket.receive_text()

                # Parse the incoming data (expecting a JSON object)
                parsed_data = json.loads(data)
                frame_data = base64.b64decode(parsed_data.get("frame"))  # Decode the base64 frame
                target=parsed_data.get("target",None)
                # Convert the decoded byte data to a numpy array
                np_arr = np.frombuffer(frame_data, np.uint8)
                img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

                # Process the frame with pose detection
                img, lmList = exercise_inst.process_frame(img)

                # Track all exercises and get feedback
                feedback = exercise_inst.track_exercises(img, lmList, target)

                # Send only the feedback data (without image)
                await websocket.send_text(json.dumps(feedback))

            except Exception as e:
                print(f"Error processing frame: {e}")
                # Send an error message if something goes wrong
                error_message = json.dumps({"error": str(e)})
                await websocket.send_text(error_message)

    except WebSocketDisconnect:
        print("Client disconnected")
    
    except Exception as e:
        print(f"Unexpected error: {e}")
    
    finally:
        await websocket.close()
        print("Connection closed")
