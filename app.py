
# Imports - Flask is main class I use for web app, jsonify converts Python data into JSON HTTP responses.
from flask import Flask, jsonify
from flask import Flask, jsonify, render_template, request, session, redirect, url_for
import re

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

import time
from functools import wraps

cache_data = {}
cache_ttl = 10800  # (3 hours rn)

def cache_route(ttl=cache_ttl):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            key = f.__name__
            now = time.time()
            if key in cache_data and (now - cache_data[key]["time"]) < ttl:
                return cache_data[key]["value"]
            result = f(*args, **kwargs)
            cache_data[key] = {"value": result, "time": now}
            return result
        return wrapped
    return decorator

# Flask app setup
app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key")

@app.after_request
def add_cache_headers(response):
    if response.content_type.startswith("audio/"):
        response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
    return response

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
    return render_template("intro.html", image_files=images)

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
            "Debt & Budgets": "JQ3",
            "Departments": "JQ4",
            "Major Cyberattacks": "JQ5",
            "Civs": "JQ6",
            "Alerts": "JQ7",
            "Airforce": "JQ8",
            "Army": "JQ9",
            "Navy": "JQ10",
            "Rockets": "JQ11",
            "Wars": "JQ12",
            "Governance & Demographics": "JQ13",
            "Fiscal Balances & Government Finance": "JQ14",
            "Monetary Supply & Banking": "JQ15",
            "Interest Rates & Debt Markets": "JQ16",
            "Inflation & Monetary Health": "JQ17",
            "Confidence & Wealth Metrics": "JQ18",
            "Energy Production & Consumption": "JQ19",
            "Civilizational Divergence": "JQ20",
            "Technology, Research, and AI": "JQ21",
            "Industry & Production": "JQ22",
            "Military-Cyber Industry": "JQ23",
            "Agriculture & Food Security": "JQ24",
            "Energy Assets & Environmental Impact": "JQ25",
            "Raw Resources": "JQ26",
            "Public Sector": "JQ27",
            "Trade & Globalization": "JQ28",
            "Special Assets Raw": "JQ29",
        }

        result = {}

        for key, ref in cells.items():
            raw_data = (
                service.spreadsheets()
                .values()
                .get(spreadsheetId=SPREADSHEET_ID, range=f"{playercode}!{ref}")
                .execute()
                .get("values", [[None]])[0][0]
            )

            if not raw_data:
                result[key] = None
                continue

            raw = raw_data.strip()

            # === Military-like Sections (Airforce, Army, Navy, Rockets, Special Assets Raw) ===
            if key in ["Airforce", "Army", "Navy", "Rockets", "Special Assets Raw"]:
                structured = []
                # Split by double newlines between major units
                blocks = [b.strip() for b in raw.split("\n\n") if b.strip()]

                for block in blocks:
                    lines = [ln.strip() for ln in block.split("\n") if ln.strip()]
                    if not lines:
                        continue
                    header = lines[0]
                    items = []

                    # Add remaining lines as items
                    if len(lines) > 1:
                        for ln in lines[1:]:
                            # Skip empty or purely numeric lines like "(3)" or "(NA)" if present
                            if re.match(r"^\(?[0-9NAna\.]*\)?$", ln.strip()):
                                continue
                            items.append(ln.strip())

                    structured.append({"header": header, "items": items})

                result[key] = {"sections": structured}
                continue

            # === Wars ===
            if key == "Wars":
                wars = []
                text = raw.replace('""', '"').strip()

                current = ""
                depth = 0
                for char in text:
                    current += char
                    if char == "{":
                        depth += 1
                    elif char == "}":
                        depth -= 1
                        if depth == 0:
                            chunk = current.strip()
                            current = ""
                            # Skip fragments too short to be a valid war
                            if len(chunk) < 50 or "Name" not in chunk:
                                continue
                            try:
                                war_data = json.loads(chunk)
                                # Ignore empty-name entries
                                if war_data.get("Name", "").strip():
                                    wars.append(war_data)
                            except Exception as e:
                                wars.append({"error": f"Parse failed: {str(e)}", "raw": chunk})

                if not wars:
                    wars.append({"error": "No valid wars found", "raw": text})

                result[key] = {"wars": wars}
                continue


            # === Economic / Governance blocks ===
            if "|" in raw and ":" in raw:
                header, rest = raw.split("|", 1)
                stats = {}
                for line in rest.split(";"):
                    if ":" in line:
                        k, v = line.split(":", 1)
                        stats[k.strip()] = v.strip()
                result[key] = {"title": header.strip(), "stats": stats}
                continue

            # === Simple multi-item sections (Departments, Budgets, etc.) ===
            text = raw.replace("\n", ";")
            parts = [p.strip() for p in text.split(";") if p.strip()]

            if "|" in parts[0]:
                header, *rest = parts
                result[key] = {"title": header.replace("|", "").strip(), "items": rest}
            elif ":" in raw and len(parts) == 1:
                k, v = raw.split(":", 1)
                result[key] = {k.strip(): v.strip()}
            elif any(x.startswith("(") or "[" in x for x in parts):
                result[key] = {"items": [" ".join(line.split()) for line in parts]}
            else:
                result[key] = raw

        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/api/global_data")
@cache_route(300)
def api_global_data():
    try:
        sheet = service.spreadsheets()
        result = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range="Global!A:LE"
        ).execute()
        rows = result.get("values", [])
        if not rows or len(rows) < 2:
            return jsonify({"error": "No data found"}), 404

        headers = rows[0]
        data = []
        for r in rows[1:]:
            entry = dict(zip(headers, r))
            if entry.get("Country") and entry.get("ID"):
                data.append(entry)

        simplified = [
            {
                "Year": e.get("timestamp", ""),
                "ID": e.get("ID", ""),
                "Country": e.get("Country", ""),
                "Leader": e.get("Leader", ""),
                "GDP": e.get("GDP", ""),
                "Debt": e.get("Debt", ""),
                "Debt-to-GDP Ratio": e.get("Debt-to-GDP Ratio", ""),
                "Government Revenue": e.get("Government Revenue", ""),
                "Total Budget Balance": e.get("Total Budget Balance", ""),
                "Inflation Rate": e.get("Inflation Rate", ""),
                "Nominal GDP Growth": e.get("Nominal GDP Growth", ""),
                "Real GDP Growth": e.get("Real GDP Growth", ""),
                "Unemployment Rate": e.get("Unemployment Rate", ""),
                "Interest Rate": e.get("Nominal Interest Rate", ""),
                "Debt Sustainability Index": e.get("Debt Sustainability Index", ""),
                "Population": e.get("Population", ""),
                "Population Growth Rate": e.get("Population Growth Rate", ""),
                "Birth Rate": e.get("Birth Rate", ""),
                "Death Rate": e.get("Death Rate", ""),
                "Migration Rate": e.get("Migration Rate", ""),
                "Industrial Score": e.get("Industrial Score", ""),
                "Technology Score": e.get("Technology Score", ""),
                "Research and Development": e.get("Research and Development", ""),
                "Post-Industrial Advancement": e.get("Post-Industrial Advancement", ""),
                "Power Projection Index": e.get("POWER PROJECTION INDEX", ""),
                "FIREPOWER INDEX": e.get("FIREPOWER INDEX", ""),
                "Performance Capacity": e.get("Performance Capacity", ""),
                "Energy Resilience Index": e.get("Energy Resilience Index", ""),
                "Total Energy Capacity (Exajoules)": e.get("Total Energy Capacity (Exajoules)", ""),
                "Energy Trade Dependency Index": e.get("Energy Trade Dependency Index", ""),
                "Carbon Net Emissions (MtCO₂)": e.get("Carbon Net Emissions (MtCO₂)", ""),
                "Consumer Confidence Index": e.get("Consumer Confidence Index", ""),
                "Popularity": e.get("Popularity", ""),
                "Sufficiency": e.get("Sufficiency", "")
            }
            for e in data
        ]
        return jsonify({"nations": simplified, "count": len(simplified)})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/global")
def global_page():
    return render_template("global.html")

@app.route("/api/wars")
@cache_route(300)
def api_wars():
    try:
        sheet = service.spreadsheets()
        result = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range="War!B2:B"
        ).execute()
        values = result.get("values", [])
        wars_raw = "\n".join([row[0] for row in values if row])

        wars = []
        text = wars_raw.replace('""', '"').strip()
        current = ""
        depth = 0
        for char in text:
            current += char
            if char == "{":
                depth += 1
            elif char == "}":
                depth -= 1
                if depth == 0:
                    chunk = current.strip()
                    current = ""
                    if len(chunk) < 50 or "Name" not in chunk:
                        continue
                    try:
                        war_data = json.loads(chunk)
                        if war_data.get("Name", "").strip():
                            wars.append(war_data)
                    except Exception as e:
                        wars.append({"error": f"Parse failed: {str(e)}", "raw": chunk})

        return jsonify({"wars": wars})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
        
@app.route("/wars")
def wars_page():
    return render_template("wars.html")

@app.route("/api/alliances")
@cache_route(300)
def api_alliances():
    try:
        sheet = service.spreadsheets()
        result = sheet.values().get(
            spreadsheetId=SPREADSHEET_ID,
            range="Alliances!A2:E"
        ).execute()
        values = result.get("values", [])

        alliances = []
        for row in values:
            if len(row) < 3:
                continue
            name = row[0] if len(row) > 0 else ""
            desc = row[1] if len(row) > 1 else ""
            members = [m.strip() for m in row[2].split(",")] if len(row) > 2 and row[2] else []
            associated = [a.strip() for a in row[3].split(",")] if len(row) > 3 and row[3] else []
            observers = [o.strip() for o in row[4].split(",")] if len(row) > 4 and row[4] else []
            alliances.append({
                "Name": name,
                "Desc": desc,
                "Members": members,
                "Associated": associated,
                "Observers": observers
            })

        return jsonify({"alliances": alliances})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/alliances")
def alliances_page():
    return render_template("alliances.html")



if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))


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
