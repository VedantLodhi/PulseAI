import cv2
import mediapipe as mp
import numpy as np
import time
import asyncio
import websockets 
import base64
import json


class PlankTracker:
    def __init__(self):
        self.pose = mp.solutions.pose.Pose()
        self.mpDraw = mp.solutions.drawing_utils
        self.holding_time = 0
        self.start_time = None
        self.threshold_angle = 170  
        self.pTime = 0

    def find_angle(self, a, b, c):
        ang = np.degrees(
            np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        )
        return abs(ang) if abs(ang) < 180 else 360 - abs(ang)

    def process_frame(self, img):
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = self.pose.process(imgRGB)
        lmList = []        
        if results.pose_landmarks:
            h, w, _ = img.shape
            for id, lm in enumerate(results.pose_landmarks.landmark):
                cx, cy = int(lm.x * w), int(lm.y * h)
                lmList.append((cx, cy))
            self.mpDraw.draw_landmarks(img, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)
        
        return img, lmList

    def check_plank(self, img, lmList):
        feedback = {"plank": False, "time_held": 0, "angle": 0}

        if len(lmList) >= 27:
            shoulder = lmList[12]  # Right Shoulder
            hip = lmList[24]  # Right Hip
            ankle = lmList[28]  # Right Ankle

            angle = self.find_angle(shoulder, hip, ankle)
            color = (0, 0, 255)  # Red for incorrect position
            
            if angle >= self.threshold_angle:
                feedback["angle"] =  angle
                feedback["plank"] = True
                color = (0, 255, 0)  # Green for correct plank position
                if self.start_time is None:
                    self.start_time = time.time()
                self.holding_time = time.time() - self.start_time
                feedback["time_held"] = int(time.time() - self.start_time)
            else:
                self.start_time = None
                self.holding_time = 0

            cv2.putText(img, f'Time: {int(self.holding_time)}s', (50, 100), cv2.FONT_HERSHEY_PLAIN, 3, color, 3)
            cv2.putText(img, f'Angle: {int(angle)}', (50, 150), cv2.FONT_HERSHEY_PLAIN, 3, color, 3)

        print(feedback)  # Now, this will execute
        return feedback

    # def run(self):
    #     cap = cv2.VideoCapture(0)
    #     while True:
    #         success, img = cap.read()
    #         if not success:
    #             break
    #         img, lmList = self.process_frame(img)
    #         img = self.check_plank(img, lmList)

    #         cTime = time.time()
    #         fps = 1 / (cTime - self.pTime)
    #         self.pTime = cTime
    #         cv2.putText(img, f'FPS: {int(fps)}', (50, 50), cv2.FONT_HERSHEY_PLAIN, 3, (255, 0, 0), 3)

    #         cv2.imshow("Plank Tracker", img)
    #         if cv2.waitKey(1) & 0xFF == ord('q'):
    #             break
    #     cap.release()
    #     cv2.destroyAllWindows()



