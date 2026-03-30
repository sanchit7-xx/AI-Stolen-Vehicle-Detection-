import cv2
import pytesseract
import os
import mysql.connector
import smtplib
import requests
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ── Camera ID ────────────────────────────────────────────────
camera_id = 1

# Prevent duplicate scans and emails
sent_plates    = set()
scanned_plates = set()   # prevents scanning same plate repeatedly

# Tesseract path
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="9582721882",
    database="vehicle_db"
)
cursor = db.cursor(dictionary=True)

# Project folder
base_path = os.path.dirname(__file__)

# Save folder
save_folder = os.path.join(base_path, "Resources", "Scanned")
os.makedirs(save_folder, exist_ok=True)

# Load cascade
PlateCascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_russian_plate_number.xml"
)

# Webcam
cap = cv2.VideoCapture(0)
cap.set(3, 1280)
cap.set(4, 720)

count         = 0
frame_counter = 0          # used to scan every N frames, not every frame


# ── Helper to push detection result to Flask ─────────────────
def send_to_frontend(plate, status, location, lat, lng, image_filename):
    data = {
        "plate":     plate,
        "status":    status,
        "location":  location,
        "latitude":  lat,
        "longitude": lng,
        "time":      datetime.now().strftime("%H:%M:%S"),
        "image":     image_filename
    }
    try:
        requests.post("http://localhost:5000/api/update", json=data, timeout=2)
        print(f"Detection sent: {plate} -> {status}")
    except Exception as e:
        print("Frontend not running, skipping update:", e)


# ── Process a detected plate image ───────────────────────────
def process_plate(imgRoi):
    global count

    filename       = os.path.join(save_folder, f"Plate_{count}.jpg")
    image_filename = f"Plate_{count}.jpg"
    cv2.imwrite(filename, imgRoi)
    print("\nImage auto-saved:", filename)

    plate_img = cv2.imread(filename)
    if plate_img is None:
        print("Error loading image")
        return

    # OCR preprocessing
    plate_img  = cv2.resize(plate_img, None, fx=3, fy=3, interpolation=cv2.INTER_CUBIC)
    gray_plate = cv2.cvtColor(plate_img, cv2.COLOR_BGR2GRAY)
    gray_plate = cv2.equalizeHist(gray_plate)
    cv2.imshow("OCR Input", gray_plate)

    # OCR
    text = pytesseract.image_to_string(
        gray_plate,
        config='--psm 8 --oem 3 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    )
    text = text.strip().replace(" ", "")
    print("Detected Plate:", text)

    if text == "":
        print("No text detected, skipping.")
        count += 1
        return

    # Skip if already scanned in this session
    if text in scanned_plates:
        print(f"Plate {text} already scanned, skipping.")
        return

    scanned_plates.add(text)

    # ── Database check ────────────────────────────────────────
    cursor.execute("SELECT * FROM stolen_vehicles WHERE vehicle_number=%s", (text,))
    result = cursor.fetchone()

    # ── Get camera location ───────────────────────────────────
    cursor.execute(
        "SELECT location_name, latitude, longitude FROM cameras WHERE camera_id=%s",
        (camera_id,)
    )
    cam_data = cursor.fetchone()

    if cam_data:
        location_name = cam_data["location_name"]
        latitude      = cam_data["latitude"]
        longitude     = cam_data["longitude"]
        map_link      = f"https://maps.google.com/?q={latitude},{longitude}"
    else:
        location_name = "Unknown"
        latitude      = 12.8433
        longitude     = 80.0606
        map_link      = "Not available"
        print("Camera location not found, using fallback.")

    # ── STOLEN ───────────────────────────────────────────────
    if result and text not in sent_plates:
        print("ALERT: STOLEN VEHICLE DETECTED!")

        owner_name    = result["owner_name"]
        vehicle_model = result["vehicle_model"]
        owner_email   = result["owner_email"]

        print("Owner:",           owner_name)
        print("Vehicle:",         vehicle_model)
        print("Owner Email:",     owner_email)
        print("Camera Location:", location_name)
        print("Map:",             map_link)

        send_to_frontend(text, "STOLEN", location_name, latitude, longitude, image_filename)

        # ── Email ─────────────────────────────────────────────
        sender_email    = "sanchitkumar207207@gmail.com"
        password        = "ibrn nprm ppfn jvmt"
        authority_email = "sanchitkumar2006@gmail.com"

        receiver_email = owner_email if owner_email else authority_email

        body = f"""
ALERT: Stolen Vehicle Detected

Vehicle Number  : {text}
Owner Name      : {owner_name}
Vehicle Model   : {vehicle_model}
Owner Email     : {owner_email if owner_email else 'Not on record'}

Camera Location : {location_name}
Coordinates     : {latitude}, {longitude}
Map             : {map_link}

This is an automated alert from the AI Stolen Vehicle Monitoring System.
Tamil Nadu Police Department - Surveillance Command Dashboard
"""
        msg = MIMEMultipart()
        msg["From"]    = sender_email
        msg["To"]      = receiver_email
        msg["Subject"] = f"Stolen Vehicle Alert - {text}"
        msg.attach(MIMEText(body, "plain", "utf-8"))

        try:
            server = smtplib.SMTP("smtp.gmail.com", 587)
            server.starttls()
            server.login(sender_email, password)
            server.sendmail(sender_email, receiver_email, msg.as_string())

            if receiver_email != authority_email:
                msg2 = MIMEMultipart()
                msg2["From"]    = sender_email
                msg2["To"]      = authority_email
                msg2["Subject"] = f"Stolen Vehicle Alert - {text}"
                msg2.attach(MIMEText(body, "plain", "utf-8"))
                server.sendmail(sender_email, authority_email, msg2.as_string())
                print(f"Copy sent to authority: {authority_email}")

            server.quit()
            print("Email Alert Sent Successfully!")
            sent_plates.add(text)

        except Exception as e:
            print("Error sending email:", e)

    # ── SAFE ─────────────────────────────────────────────────
    elif not result:
        print("Vehicle not found in stolen database - SAFE")
        send_to_frontend(text, "SAFE", location_name, latitude, longitude, image_filename)

    count += 1


# ── Main Loop ─────────────────────────────────────────────────
while True:

    success, img = cap.read()
    if not success:
        break

    frame_counter += 1

    gray         = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    numberPlates = PlateCascade.detectMultiScale(gray, 1.1, 4)

    for (x, y, w, h) in numberPlates:
        if w * h > 500:
            cv2.rectangle(img, (x, y), (x + w, y + h), (255, 0, 0), 2)
            cv2.putText(
                img, "NumberPlate", (x, y - 5),
                cv2.FONT_HERSHEY_COMPLEX_SMALL, 1, (255, 0, 0), 2
            )

            imgRoi = img[y:y + h, x:x + w]
            cv2.imshow("ROI", imgRoi)

            # ── Auto scan every 30 frames to avoid spamming ──
            if frame_counter % 30 == 0:
                process_plate(imgRoi)

    cv2.imshow("Video", img)

    # Press Q to quit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()