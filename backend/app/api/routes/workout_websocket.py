import asyncio
import json
import cv2
import numpy as np
import mediapipe as mp
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, APIRouter
import base64
import math
import os


router = APIRouter()

mp_pose = mp.solutions.pose
pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)

def load_stored_landmarks():
    json_file_path = os.path.join(os.path.dirname(__file__), 'selected_landmarks.json')
    with open(json_file_path, 'r') as file:
        data = json.load(file)
    return data  

stored_landmarks = load_stored_landmarks()

def process_frame(frame):
    """Process the frame to detect landmarks using MediaPipe"""
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = pose.process(frame_rgb)
    return result

def calculate_accuracy(user_landmarks, stored_landmarks, frame_index, distance_threshold=10):
    """Calculate the accuracy of detected landmarks."""
    matched_landmarks = 0
    total_landmarks = 0

    stored_frame = stored_landmarks.get(f"frame_{frame_index}", {})

    for landmark, stored_coords in stored_frame.items():
        if landmark in user_landmarks:
            user_coords = user_landmarks[landmark]
            distance = euclidean_distance(user_coords, stored_coords)
            if distance <= distance_threshold:
                matched_landmarks += 1
            total_landmarks += 1
y
    if total_landmarks == 0:
        return 0  # Avoid division by zero
    accuracy = (matched_landmarks / total_landmarks) * 100
    return accuracy

def euclidean_distance(point1, point2):
    """Calculate Euclidean distance between two points"""
    return math.sqrt((point1['x'] - point2['x'])**2 + (point1['y'] - point2['y'])**2 + (point1['z'] - point2['z'])**2)

def decode_base64_to_frame(base64_data):
    """Decode a base64 string to an OpenCV frame"""
    img_data = base64.b64decode(base64_data)
    nparr = np.frombuffer(img_data, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return frame

def extract_landmarks(result):
    """Extract landmarks from the MediaPipe result"""
    landmarks = {}
    if result.pose_landmarks:
        for landmark in mp_pose.PoseLandmark:
            point = result.pose_landmarks.landmark[landmark]
            landmarks[landmark.name] = {"x": point.x, "y": point.y, "z": point.z}
    return landmarks

@app.websocket("/ws/workout")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("client connected")
    frame_index = 1  # Set a default frame_index (this can be dynamic if you want to track it)
    try:
        while True:
            try:
                # Receive the frame from the websocket
                frame_base64 = await websocket.receive_text()

                # Decode the base64 frame
                frame = decode_base64_to_frame(frame_base64)

                # Process the frame and extract landmarks
                result = process_frame(frame)
                user_landmarks = extract_landmarks(result)

                # Calculate the accuracy based on stored landmarks
                accuracy = calculate_accuracy(user_landmarks, stored_landmarks, frame_index)

                # Send the accuracy back to the client
                await websocket.send_json({
                    "accuracy": accuracy
                })

                # Increment frame_index (or dynamically assign based on your logic)
                frame_index += 1
            
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
