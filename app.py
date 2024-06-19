from flask import Flask, json, render_template, redirect, request, send_from_directory, session, jsonify, send_file, g
from flask_mail import Mail, Message
from flask_babel import Babel, _, lazy_gettext as _l, gettext
from flask_compress import Compress
from flask_cors import CORS, cross_origin
from dotenv import load_dotenv
import os
import logging
from datetime import datetime
from pywebpush import webpush, WebPushException

# Load environment variables from .env file
load_dotenv()

# Initialize the Flask application
app = Flask(__name__, static_folder='static')
app.secret_key = os.getenv("SECRET_KEY")

# Initialize CORS
#CORS(app, origins="*")
CORS(app, origins=[os.getenv("CORS_ORIGINS")])

# VAPID keys
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_CLAIMS = {"sub": "mailto:mariana.placito@gmail.com"}

# Directory where files are stored
FILE_DIRECTORY = os.path.join('static', 'img')

# File to log downloads
LOG_FILE = os.path.join('static', 'downloads', 'logfile.txt')

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Ensure the log directory and file exist
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
if not os.path.exists(LOG_FILE):
    with open(LOG_FILE, 'w') as f:
        f.write('Download Log\n')

# Set up mail settings
mail_settings = {
    "MAIL_SERVER": 'smtp.gmail.com',
    "MAIL_PORT": 465,
    "MAIL_USE_TLS": False,
    "MAIL_USE_SSL": True,
    "MAIL_USERNAME": os.getenv("MAIL_USERNAME"),
    "MAIL_PASSWORD": os.getenv("MAIL_PASSWORD")
}

# Configure Flask app with mail settings
app.config.update(mail_settings)
mail = Mail(app)
babel = Babel(app)
Compress(app)

# Set default and supported locales
app.config['BABEL_DEFAULT_LOCALE'] = 'en'
app.config['BABEL_SUPPORTED_LOCALES'] = ['en', 'pt']

# Define the Contact class
class Contact:
    def __init__(self, name, email, message):
        self.name = name
        self.email = email
        self.message = message

# Function to get the locale
def get_locale():
    # Check if the language query parameter is set and valid
    if 'lang' in request.args:
        lang = request.args.get('lang')
        if lang in app.config['BABEL_SUPPORTED_LOCALES']:
            session['lang'] = lang
            return session['lang']
    # If not set via query, check if we have it stored in the session
    elif 'lang' in session:
        return session.get('lang')
    # Otherwise, use the browser's preferred language
    return request.accept_languages.best_match(app.config['BABEL_SUPPORTED_LOCALES'])

# Initialize Babel with the locale selector
babel = Babel(app, locale_selector=get_locale)

# Context processor to inject Babel
@app.context_processor
def inject_babel():
    return dict(_=gettext)

# Context processor to inject locale
@app.context_processor
def inject_locale():
    return {'get_locale': get_locale}

@app.before_request
def before_request():
    if request.path == '/robots.txt':
        return send_from_directory(app.static_folder, 'robots.txt')
    g.current_url = request.url.replace('http://', 'https://', 1)

@app.route('/static/<path:path>')
@cross_origin()
def serve_static(path):
    return send_from_directory('static', path)

# Route to get the current locale
@app.route('/get_locale', methods=['GET'])
@cross_origin()
def get_current_locale():
    return jsonify({'locale': get_locale()})

# Define the home route
@app.route('/')
@cross_origin()
def home():
    logger.debug("Home route accessed")
    return render_template('index.html', current_locale=get_locale())

# Define the privacy policy route
@app.route('/privacy_policy.html')
@cross_origin()
def privacy_policy():
    return render_template('privacy_policy.html', current_locale=get_locale())

# Define the terms route
@app.route('/terms.html')
@cross_origin()
def terms():
    return render_template('terms.html', current_locale=get_locale())

# Route to handle form submissions
@app.route('/send', methods=['POST'])
@cross_origin()
def send():
    if request.method == 'POST':
        try:
            # Validate form data
            name = request.form["name"]
            email = request.form["email"]
            message = request.form["message"]

            if not name or not email or not message:
                return jsonify({'status': 'error', 'message': _l('All fields are required!')})

            formContact = Contact(name, email, message)

            # Prepare and send the email
            msg = Message(
                subject=f'{"Portfolio Contact from"} {formContact.name}',
                sender=app.config.get("MAIL_USERNAME"),
                recipients=['mariana.placito@gmail.com'],
                body=f'''
                    Portfolio Contact from {formContact.name}
                    With the email: {formContact.email}

                    Message:
                    {formContact.message}
                '''
            )
            mail.send(msg)
            return jsonify({'status': 'success', 'message': _l('Message sent successfully!')})

        except Exception as e:
            logger.error(f"Error while sending message: {e}")
            return jsonify({'status': 'error', 'message': _l('An error occurred while sending the message. Please try again later.')})
    
    return jsonify({'status': 'error', 'message': _l('Invalid request method.')})

# Route to set the language
@app.route('/set_language/<language>', methods=['POST'])
@cross_origin()
def set_language(language):
    if language in app.config['BABEL_SUPPORTED_LOCALES']:
        session['lang'] = language
    return jsonify({'status': 'success', 'lang': language})

# Route to get translations
@app.route('/translations/<lang>/LC_MESSAGES/messages.po', methods=['GET'])
@cross_origin()
def get_translation(lang):
    file_path = os.path.join('translations', lang, 'LC_MESSAGES', 'messages.po')
    logger.debug(f"Looking for file at: {file_path}")
    if os.path.exists(file_path):
        return send_file(file_path)
    else:
        logger.error(f"File not found at: {file_path}")
        return jsonify({'error': 'File not found'}), 404

# Function to log downloads
def log_download(file_name, user_ip):
    log_entry = f"{datetime.now()} - {user_ip} downloaded {file_name}\n"
    logger.debug(f"Logging download: {log_entry}")
    
    try:
        with open(LOG_FILE, 'a') as log_file:
            log_file.write(log_entry)
        logger.debug("Log entry written successfully.")
    except Exception as e:
        logger.error(f"Error writing log entry: {e}")

# Route to send the CV file
@app.route('/cv_file')
@cross_origin()
def cv_file():
    try:
        file_name = 'resume.pdf'
        file_path = os.path.join(FILE_DIRECTORY, file_name)
        user_ip = request.remote_addr
        log_download(file_name, user_ip)
        logger.debug(f"Sending file: {file_path} to user: {user_ip}")
        return send_file(file_path, as_attachment=True)
    except Exception as e:
        logger.error(f"Error in /cv_file route: {e}")
        return jsonify({'error': 'File not found'}), 404

# Route to download a file
@app.route('/download/<filename>', methods=['GET'])
@cross_origin()
def download_file(filename):
    try:
        logger.debug(f"Download request received for file: {filename}")
        file_path = os.path.join(FILE_DIRECTORY, filename)
        if os.path.exists(file_path):
            user_ip = request.remote_addr
            log_download(filename, user_ip)
            logger.debug(f"File {filename} exists and is being sent to the user.")
            return send_file(file_path, as_attachment=True)
        else:
            logger.error(f"File {filename} not found at path: {file_path}")
            return jsonify({'error': 'File not found'}), 404
    except Exception as e:
        logger.error(f"Error in /download/<filename> route: {e}")
        return jsonify({'error': 'An error occurred'}), 500

@app.route('/subscribe', methods=['POST'])
@cross_origin()
def subscribe():
    # Print the request data for debugging
    print("Received subscription request:", request.get_json())
    
    subscription_info = request.get_json()
    
    try:
        # Additional debug information
        print("Subscription info:", subscription_info)
        
        webpush(
            subscription_info,
            json.dumps({"title": "Push Notification", "body": "You have a new message!"}),
            subscription_info=subscription_info,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims=VAPID_CLAIMS
        )
        print("Web push successful")
        
        return jsonify({"success": True}), 201
    except WebPushException as ex:
        print("I'm sorry, but I can't do that: {}", repr(ex))
        return jsonify({"success": False}), 500

@app.route('/sitemap.xml')
def sitemap_xml():
        return send_from_directory(app.static_folder, 'sitemap.xml')

if __name__ == "__main__":
    base_path = os.path.dirname(os.path.abspath(__file__))
    cert_file = os.path.join(base_path, '127.0.0.1+1.pem')
    key_file = os.path.join(base_path, '127.0.0.1+1-key.pem')
    context = (cert_file, key_file)
    app.run(ssl_context=context, port=5000, debug=True)

# Import CLI commands
import cli  # Ensure this line is at the end of your app.py
