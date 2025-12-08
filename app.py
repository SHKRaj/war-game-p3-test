
# Imports - Flask is main class I use for web app, jsonify converts Python data into JSON HTTP responses.
from flask import Flask, jsonify
from flask import Flask, jsonify, render_template, request, session, redirect, url_for

# Imports - service_account handles authentication, uses my private key to create credentials to identify app to google's APIs; build() constructs an object that knows how to talk to a specific Google service, in this case, sheets.
from google.oauth2 import service_account
from googleapiclient.discovery import build

# Imports - load_dotenv reads the .env file and injects each line TEMPORARILY in OS's enviornmental variables
from dotenv import load_dotenv

# Imports - os lets me access those environmental variables via os.environ; json lets me convert b/w JSON text & Python objects.
import os, json

#  Loading Environmental Value for GoogleCreds
load_dotenv()
# I don't want my google creds to be public on GitHub, so I am loading it at runtime.
# dotenv is a very small library that reads a file named .env (key-value pairs) and temporarily sets them in the OS environment

# Flask app setup
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")

# Google Sheets setup; not .readonly since I am going to edit the sheet. 
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

# os.environ["GOOGLE_CREDENTIALS"] retrieves the JSON string from my .env. 
# json.loads() turns that string into a dict
creds_info = json.loads(os.environ["GOOGLE_CREDENTIALS"])
# Constructs a credential object from dict, knows how to sign requests w/ my private key, attach OAuth tokens, and renew as needed.
creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
# I'm essentially saying: “Hi Google, I’m this service account, and I’m allowed to access Sheets.”

# Connect to Sheets API
service = build("sheets", "v4", credentials=creds)
# Conceptually, I'm basically kind of making a mini browser to talk to Google w/o opening webpage.

# MY SHEET ID & BASIC DATA
SPREADSHEET_ID = "1ajiYnuzqZKDZjGe3CmZTpgb4dkwWrlAKRQslP2Piidc"
RANGE_NAME = "AirAssets!A:Z"  


# === ROUTES ===

@app.route("/")
def home():
    image_folder = os.path.join(app.static_folder, "images")
    images = [f"images/{img}" for img in os.listdir(image_folder)
              if img.lower().endswith((".jpg", ".jpeg", ".png"))]
    return render_template("base.html", image_files=images)


@app.route("/enter_code", methods=["GET", "POST"])
def enter_code():
    if request.method == "POST":
        playercode = request.form["playercode"].strip()
        session["playercode"] = playercode
        return redirect(url_for("dashboard"))
    return render_template("index.html")


@app.route("/dashboard")
def dashboard():
    playercode = session.get("playercode")
    if not playercode:
        return redirect(url_for("enter_code"))
    return render_template("dashboard.html", playercode=playercode)


# === API ENDPOINTS ===

@app.route("/api/player/<playercode>")
def api_player(playercode):
    """Load all relevant info for the playercode sheet."""
    try:
        sheet = service.spreadsheets()
        result = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=f"{playercode}!A:JQ"
        ).execute()
        values = result.get("values", [])
        if not values:
            return jsonify({"error": f"No data found for player {playercode}"}), 404
        return jsonify({"playercode": playercode, "data": values})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/contracts/<playercode>", methods=["POST"])
def api_update_contracts(playercode):
    try:
        data = request.json
        contracts = data.get("contracts", [])
        total = sum(int(c) for c in contracts)

        # Get the max cap from J1
        max_allowed = int(service.spreadsheets().values().get(
            spreadsheetId=SPREADSHEET_ID,
            range=f"{playercode}!J1"
        ).execute().get("values", [[0]])[0][0])

        if total > max_allowed:
            return jsonify({
                "status": "error",
                "message": f"Contract total {total} exceeds max allocation {max_allowed}"
            }), 400

        # Update the sheet if valid
        body = {"values": [[c] for c in contracts]}
        service.spreadsheets().values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=f"{playercode}!I2:I{len(contracts)+1}",
            valueInputOption="USER_ENTERED",
            body=body
        ).execute()

        return jsonify({"status": "updated", "message": f"{len(contracts)} rows updated"})

    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500



@app.route("/api/policies/<playercode>", methods=["POST"])
def api_update_policies(playercode):
    """Update Q60:Q69 with selected policies."""
    try:
        policies = request.json.get("policies", [])
        body = {"values": [[p] for p in policies]}
        service.spreadsheets().values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=f"{playercode}!Q60:Q{60 + len(policies)}",
            valueInputOption="USER_ENTERED",
            body=body
        ).execute()
        return jsonify({"status": "policies updated"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/data/<playercode>")
def api_data_sections(playercode):
    """Load and format structured sheet data for display."""
    try:
        cells = {
            "Nation": "JQ1",
            "Capital": "JQ2",
            "Budgets": "JQ3",
            "Departments": "JQ4",
            "Cyberattacks": "JQ5",
            "Civs": "JQ6",
            "Alerts": "JQ7",
            "Airforce": "JQ8",
            "Army": "JQ9",
            "Navy": "JQ10",
        }
        result = {}

        for key, ref in cells.items():
            raw = (
                service.spreadsheets()
                .values()
                .get(spreadsheetId=SPREADSHEET_ID, range=f"{playercode}!{ref}")
                .execute()
                .get("values", [[None]])[0][0]
            )

            if not raw:
                result[key] = None
                continue

            text = raw.strip().replace("\n", ";")
            parts = [p.strip() for p in text.split(";") if p.strip()]

            # --- Handle block formats like "Header | item; item; ..."
            if "|" in parts[0]:
                header, *rest = parts
                header = header.replace("|", "").strip()
                result[key] = {
                    "title": header,
                    "items": rest,
                }
            # --- Handle single colon-based key/value pairs
            elif ":" in raw and len(parts) == 1:
                k, v = raw.split(":", 1)
                result[key] = {k.strip(): v.strip()}
            # --- Handle large list-style sections (Departments, Budgets)
            elif any(x.startswith("(") or "[" in x for x in parts):
                formatted = []
                for line in parts:
                    # remove double spaces and line fragments
                    line = " ".join(line.split())
                    formatted.append(line)
                result[key] = {"items": formatted}
            else:
                # plain text fallback
                result[key] = raw

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500




if __name__ == "__main__":
    app.run(debug=True)


'''BASIC HOME TESTING
@app.route("/")
def home():
    try:
        sheet = service.spreadsheets()
        # .values().get() prepares the HTTP GET request, and the .execute() call is making the actual network request & returns JSON response as Python Dictionary
        result = sheet.values().get(spreadsheetId=SPREADSHEET_ID, range=RANGE_NAME).execute()
        values = result.get("values", [])
        return jsonify(values)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
'''
