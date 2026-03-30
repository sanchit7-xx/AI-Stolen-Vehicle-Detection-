from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)
CORS(app)

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
SCANNED_DIR = os.path.join(BASE_DIR, "Resources", "Scanned")

def get_db():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="9582721882",
        database="vehicle_db"
    )

latest_detection = {
    "plate":     "—",
    "status":    "WAITING",
    "location":  "—",
    "latitude":  12.8433,
    "longitude": 80.0606,
    "time":      "—",
    "image":     None
}

history = []


@app.route("/api/latest", methods=["GET"])
def get_latest():
    return jsonify(latest_detection)


@app.route("/api/history", methods=["GET"])
def get_history():
    return jsonify(history)


@app.route("/api/update", methods=["POST"])
def update_detection():
    global latest_detection
    data = request.json
    latest_detection = data
    history.insert(0, data)
    if len(history) > 20:
        history.pop()
    print(f"[Flask] Received: {data['plate']} -> {data['status']}")
    return jsonify({"ok": True})


@app.route("/api/image/<filename>", methods=["GET"])
def serve_image(filename):
    return send_from_directory(SCANNED_DIR, filename)


@app.route("/api/search", methods=["GET"])
def search_vehicle():
    """
    Searches only the stolen_vehicles table.
    e.g. GET /api/search?plate=BKL34F500
    """
    plate = request.args.get("plate", "").strip().upper()

    if not plate:
        return jsonify({"ok": False, "error": "Plate number is required."}), 400

    try:
        db     = get_db()
        cursor = db.cursor(dictionary=True)

        # Search stolen_vehicles table only
        cursor.execute(
            "SELECT * FROM stolen_vehicles WHERE vehicle_number = %s",
            (plate,)
        )
        result = cursor.fetchone()

        cursor.close()
        db.close()

        if result:
            # Check in-memory history for last detected location
            last_location = "Not detected yet"
            last_time     = "—"
            for h in history:
                if h.get("plate") == plate:
                    last_location = h.get("location", "—")
                    last_time     = h.get("time", "—")
                    break

            return jsonify({
                "ok":           True,
                "found":        True,
                "status":       "STOLEN",
                "plate":        result["vehicle_number"],
                "ownerName":    result.get("owner_name",    "—"),
                "vehicleModel": result.get("vehicle_model", "—"),
                "ownerEmail":   result.get("owner_email",   "—"),
                "lastLocation": last_location,
                "lastTime":     last_time,
            })
        else:
            return jsonify({
                "ok":    True,
                "found": False,
                "status": "NOT FOUND",
                "plate": plate,
            })

    except Exception as e:
        print(f"[Flask] Search error: {e}")
        return jsonify({"ok": False, "error": "Database error. Please try again."}), 500


@app.route("/api/add-vehicle", methods=["POST"])
def add_vehicle():
    data = request.json

    plate         = data.get("plate", "").strip().upper()
    owner_name    = data.get("ownerName", "").strip()
    owner_email   = data.get("ownerEmail", "").strip()
    vehicle_model = data.get("vehicleModel", "").strip()

    if not plate or not owner_name or not owner_email or not vehicle_model:
        return jsonify({"ok": False, "error": "All fields are required."}), 400

    try:
        db     = get_db()
        cursor = db.cursor()

        cursor.execute(
            "SELECT vehicle_number FROM stolen_vehicles WHERE vehicle_number = %s",
            (plate,)
        )
        existing = cursor.fetchone()

        if existing:
            cursor.close()
            db.close()
            return jsonify({"ok": False, "error": f"Plate {plate} is already registered in the database."}), 409

        cursor.execute(
            """
            INSERT INTO stolen_vehicles (vehicle_number, owner_name, owner_email, vehicle_model, status)
            VALUES (%s, %s, %s, %s, 'STOLEN')
            """,
            (plate, owner_name, owner_email, vehicle_model)
        )
        db.commit()

        print(f"[Flask] New stolen vehicle added: {plate} | {owner_name} | status: STOLEN")

        cursor.close()
        db.close()

        return jsonify({
            "ok": True,
            "message": f"Vehicle {plate} successfully registered as STOLEN in the database."
        }), 201

    except Exception as e:
        print(f"[Flask] DB error: {e}")
        return jsonify({"ok": False, "error": "Database error. Please try again."}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)