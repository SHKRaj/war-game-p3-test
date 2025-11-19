
# Imports - Flask is main class I use for web app, jsonify converts Python data into JSON HTTP responses.
from flask import Flask, jsonify
from flask import render_template

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

# Google Sheets setup; not .readonly since I am going to edit the sheet.
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]

# os.environ["GOOGLE_CREDENTIALS"] retrieves the JSON string from my .env. 
# json.loads() turns that string into a dict
creds_info = json.loads(os.environ["GOOGLE_CREDENTIALS"])
# Constructs a credential object from dict, knows how to sign requests w/ my private key, attack OAuth tokens, and renew as needed.
creds = service_account.Credentials.from_service_account_info(creds_info, scopes=SCOPES)
# I'm essentially saying: “Hi Google, I’m this service account, and I’m allowed to access Sheets.”

# Connect to Sheets API
service = build("sheets", "v4", credentials=creds)
# Conceptually, I'm basically kind of making a mini browser to talk to Google w/o opening webpage.

# MY SHEET ID & BASIC DATA
SPREADSHEET_ID = "1ajiYnuzqZKDZjGe3CmZTpgb4dkwWrlAKRQslP2Piidc"
RANGE_NAME = "AirAssets!A:Z"  


@app.route("/")
def home():
    image_folder = os.path.join(app.static_folder, "images")
    images = [f"images/{img}" for img in os.listdir(image_folder)
              if img.lower().endswith((".jpg", ".jpeg", ".png"))]
    return render_template("base.html", image_files=images)

'''
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

if __name__ == "__main__":
    app.run(debug=True)
