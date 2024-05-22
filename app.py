from flask import Flask, render_template, redirect, request, flash, session, url_for, jsonify, send_file
from flask_mail import Mail, Message
from waitress import serve
from flask_babel import Babel, gettext as _
from dotenv import load_dotenv
import os
import logging
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Initialize the Flask application first
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

# Directory where files are stored
FILE_DIRECTORY = os.path.join('static', 'img')

# File to log downloads
LOG_FILE = os.path.join('static', 'downloads', 'logfile.txt')

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

app.config.update(mail_settings)
mail = Mail(app)
app.config['BABEL_DEFAULT_LOCALE'] = 'en'
app.config['BABEL_SUPPORTED_LOCALES'] = ['en', 'pt']
babel = Babel(app)

# Define the Contact class
class Contact:
    def __init__(self, name, email, message):
        self.name = name
        self.email = email
        self.message = message

# Manually set the locale before each request
@app.before_request
def set_locale():
    lang = session.get('lang', request.accept_languages.best_match(app.config['BABEL_SUPPORTED_LOCALES']))
    babel.locale_selector_func = lambda: lang

# Define routes
@app.route('/')
def home():
    print("Home route accessed")  # Debug output
    lang = session.get('lang', 'en')
    return render_template('index.html', lang=lang)

@app.route('/send', methods=['POST'])
def send():
    if request.method == 'POST':
        try:
            # Validate form data
            name = request.form["name"]
            email = request.form["email"]
            message = request.form["message"]

            if not name or not email or not message:
                return jsonify({'status': 'error', 'message': _('All fields are required!')})

            formContact = Contact(name, email, message)

            # Prepare and send the email
            msg = Message(
                subject=f'{_("Portfolio Contact from")} {formContact.name}',
                sender=app.config.get("MAIL_USERNAME"),
                recipients=['mariana.placito@gmail.com'],
                body=f'''
                    {_("Portfolio Contact from")} {formContact.name}

                    {_("Message")}:
                    {formContact.message}
                '''
            )
            mail.send(msg)
            return jsonify({'status': 'success', 'message': _('Message sent successfully!')})

        except Exception as e:
            return jsonify({'status': 'error', 'message': _('An error occurred while sending the message. Please try again later.')})
    
    return jsonify({'status': 'error', 'message': _('Invalid request method.')})

@app.route('/set_language/<language>', methods=['GET'])
def set_language(language):
    if language in app.config['BABEL_SUPPORTED_LOCALES']:
        session['lang'] = language
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify({'status': 'success'})
    return redirect(request.referrer or url_for('home'))

@app.route('/translations/<lang>/LC_MESSAGES/messages.po', methods=['GET'])
def get_translation(lang):
    file_path = os.path.join('translations', lang, 'LC_MESSAGES', 'messages.po')
    print(f"Looking for file at: {file_path}")  # Debug output
    if os.path.exists(file_path):
        return send_file(file_path)
    else:
        print(f"File not found at: {file_path}")  # Debug output
        return jsonify({'error': 'File not found'}), 404

def log_download(file_name, user_ip):
    log_entry = f"{datetime.now()} - {user_ip} downloaded {file_name}\n"
    logger.debug(f"Logging download: {log_entry}")
    
    try:
        with open(LOG_FILE, 'a') as log_file:
            log_file.write(log_entry)
        logger.debug("Log entry written successfully.")
    except Exception as e:
        logger.error(f"Error writing log entry: {e}")

@app.route('/cv_file')
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

@app.route('/download/<filename>', methods=['GET'])
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


# Serve the application with Waitress
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    from waitress import serve
    serve(app, host='0.0.0.0', port=port)