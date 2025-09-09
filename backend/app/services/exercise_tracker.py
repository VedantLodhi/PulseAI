import cv2
import mediapipe as mp
import numpy as np
import time
import asyncio
import websockets
import base64
import json

class ExerciseTracker:
    def __init__(self):
        self.pose = mp.solutions.pose.Pose()
        self.mpDraw = mp.solutions.drawing_utils
        self.start_time = None
        self.holding_time = 0
        self.rep_count = {"squat": 0, "pushup": 0, "jumping_jack": 0}
        self.exercise_state = {"squat": False, "pushup": False, "jumping_jack": False}

    def find_angle(self, a, b, c):
        """Calculate the angle between three points."""
        ang = np.degrees(
            np.arctan2(c[1] - b[1], c[0] - b[0]) - np.arctan2(a[1] - b[1], a[0] - b[0])
        )
        return abs(ang) if abs(ang) < 180 else 360 - abs(ang)

    def process_frame(self, img):
        """Process frame and detect landmarks."""
        imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = self.pose.process(imgRGB)
        lmList = []

        if results.pose_landmarks:
            h, w, _ = img.shape
            for lm in results.pose_landmarks.landmark:
                cx, cy = int(lm.x * w), int(lm.y * h)
                lmList.append((cx, cy))
            self.mpDraw.draw_landmarks(img, results.pose_landmarks, mp.solutions.pose.POSE_CONNECTIONS)

        return img, lmList

    def track_plank(self, lmList, target=None):
        """Check if the user is in a correct plank position."""
        if len(lmList) < 27:
            return {"plank": "False", "time_held": 0}

        shoulder, hip, ankle = lmList[12], lmList[24], lmList[28]
        angle = self.find_angle(shoulder, hip, ankle)

        shoulder_hip_diff = abs(shoulder[1] - hip[1])  
        hip_ankle_diff = abs(hip[1] - ankle[1])


        if shoulder_hip_diff < 50 and hip_ankle_diff < 50 and 160 <= angle <= 180:
            if self.start_time is None:
                self.start_time = time.time()
            self.holding_time = int(time.time() - self.start_time)

            plank_message ="Keep trying"
            if target is not None and self.holding_time is not None and self.holding_time>=target:
                return {"challenge-completed":bool(True)}
            elif self.holding_time<10:
                return {"plank": bool(True), "time_held": self.holding_time, "angle": int(angle), "plank_message": "Keep going! Hold for a little longer"}
            elif self.holding_time>30:
                return {"plank": bool(True), "time_held": self.holding_time, "angle": int(angle), "plank_message": "Great job! You're holding strong!"}
            elif self.holding_time%10==0:
                return {"plank": bool(True), "time_held": self.holding_time, "angle": int(angle), "plank_message": f"You've held the plank for {self.holding_time} seconds!"}
            return {"plank": bool(True), "time_held": self.holding_time, "angle": int(angle), "plank_message": "Try more"}
        else:
            self.start_time = None
            self.holding_time = 0
            return {"plank": False, "time_held": 0}


    def track_squat(self, lmList, target=None):
        """Count squat repetitions and provide feedback on posture and movement."""
        if len(lmList) < 27:
            return {"squat_reps": self.rep_count["squat"], "squat_message": "Landmarks missing", "correct_squat": False, "posture": "N/A"}

        # Get keypoints
        shoulder, hip, knee, ankle = lmList[12], lmList[24], lmList[26], lmList[28]
    
        # Calculate angles
        squat_angle = self.find_angle(hip, knee, ankle)  # Angle of knee during squat
        torso_angle = self.find_angle(shoulder, hip, knee)  # Angle of torso

        print(f"Squat Angle: {squat_angle}, Torso Angle: {torso_angle}")

        # Provide posture feedback
        if torso_angle > 95:
            posture = "Lean forward slightly"
        elif torso_angle < 65:
            posture = "Too much forward lean"
        else:
            posture = "Good posture"

        # Detect if the person is standing (Torso angle near 180°)
        if torso_angle > 170 and squat_angle > 150:  # Torso angle close to upright and knees straight
            self.exercise_state["squat"] = False  # The person is standing, so no squat in progress
            return {
                "squat_reps": self.rep_count["squat"],
                "squat_message": "Not a squat. Keep your body straight.",
                "correct_squat": False,
                "posture": posture
            }

        # Count squat reps based on knee angle (squat down and stand up logic)
        if squat_angle < 85:  # Going down (squat)
            self.exercise_state["squat"] = True
        elif self.exercise_state["squat"] and squat_angle > 150:  # Coming up (standing)
            self.rep_count["squat"] += 1
            self.exercise_state["squat"] = False

        # Provide squat progress messages
        squat_message = "Don't loosen your body"
        if self.rep_count["squat"]>=target:
            return {"challenge-completed":bool(True)}
        elif self.rep_count["squat"] < 5:
            squat_message = "Keep going! Squats in progress 💪"
        elif self.rep_count["squat"] % 5 == 0:
            squat_message = f"🔥 Great job! {self.rep_count['squat']} squats done!"

        return {
            "squat_reps": self.rep_count["squat"],
            "squat_message": squat_message,
            "correct_squat": squat_angle < 90,  # Check if squat angle is below 90 degrees for correct form
            "posture": posture  # Feedback on posture
        }

    def track_pushup(self, lmList, target=None):
        """Accurately count push-up reps by ensuring correct posture and movement, only when leaning."""
        if len(lmList) < 29:  
            return {"pushup_reps": self.rep_count["pushup"], "pushup_message": "Not enough landmarks detected"}

        shoulder, elbow, wrist = lmList[12], lmList[14], lmList[16]
        hip, knee, ankle = lmList[24], lmList[26], lmList[28]

        pushup_angle = self.find_angle(shoulder, elbow, wrist)  # Arm movement
        body_angle = self.find_angle(shoulder, hip, ankle)  # Ensur`e body is straight

        print(f"Push-up angle: {pushup_angle}, Body angle: {body_angle}")

        if body_angle > 160:  # If body angle is too upright, they are standing
            return {"pushup_reps": self.rep_count["pushup"], "pushup_message": "Please get into a proper push-up position (leaning)"}

        if body_angle < 160:  
            return {"pushup_reps": self.rep_count["pushup"], "pushup_message": "Keep your body straight"}

        if pushup_angle < 50:  # Going down (arm angle is smaller)
            self.exercise_state["pushup"] = "down"  # Mark the state as going down

        elif self.exercise_state["pushup"] == "down" and pushup_angle > 160:  # Coming up (arm angle is larger)
            self.rep_count["pushup"] += 1  # Increment rep count
            self.exercise_state["pushup"] = "up"  # Mark the state as coming up

        # Reset after completing a rep (ensure the next push-up starts fresh)
        elif self.exercise_state["pushup"] == "up" and pushup_angle < 150:
            self.exercise_state["pushup"] = "reset"  # Reset to wait for the next rep

        # Step 4: Message feedback based on form
        if body_angle > 160:
            return {"pushup_reps": self.rep_count["pushup"], "pushup_message": "Please get into a proper push-up position (leaning)"}
        elif self.exercise_state["pushup"] == "down":
            return {"pushup_reps": self.rep_count["pushup"], "pushup_message": "Going down, keep going!"}
        elif self.exercise_state["pushup"] == "up":
            return {"pushup_reps": self.rep_count["pushup"], "pushup_message": "Great job! Coming up!"}
        else:
            return {"pushup_reps": self.rep_count["pushup"], "pushup_message": "Good form! Keep going!"}


    def track_jumping_jack(self, lmList):
        """Count jumping jack repetitions."""
        if len(lmList) < 17:
            return {"jumping_jack_reps": self.rep_count["jumping_jack"]}

        wrist_left, wrist_right, shoulder_left, shoulder_right = (
            lmList[15], lmList[16], lmList[11], lmList[12])
        arm_angle = self.find_angle(wrist_left, shoulder_left, wrist_right)

        if arm_angle > 140:
            self.exercise_state["jumping_jack"] = True
        elif self.exercise_state["jumping_jack"] and arm_angle < 50:
            self.rep_count["jumping_jack"] += 1
            self.exercise_state["jumping_jack"] = False

        return {"jumping_jack_reps": self.rep_count["jumping_jack"]}

    def track_exercises(self, img, lmList, target=None):
        """Track all exercises and return feedback."""
        feedback = {}
        feedback.update(self.track_plank(lmList, target))
        feedback.update(self.track_squat(lmList, target))
        feedback.update(self.track_pushup(lmList, target))
        feedback.update(self.track_jumping_jack(lmList))
        return feedback

