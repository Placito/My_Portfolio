from flask import Flask, render_template, redirect, request, flash, send_from_directory, session, url_for, jsonify, send_file, abort
from flask_mail import Mail, Message
from waitress import serve
from flask_babel import Babel, gettext as _
from dotenv import load_dotenv
import os
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Initialize the Flask application first
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY")

# Directory where files are stored
FILE_DIRECTORY = 'static/downloads'

# File to log downloads
LOG_FILE = 'static/downloads/logfile.txt'

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

@app.route('/send', methods=['GET', 'POST'])
def send():
    if request.method == 'POST':
        formContact = Contact(
            request.form["name"],
            request.form["email"],
            request.form["message"]
        )

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
        flash(_('Message sent successfully!'))
    return redirect('/')

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

@app.route('/cv_file')
def cv_file():
    file_name = 'resume.pdf'
    file_path = os.path.join('static', 'img', file_name)
    user_ip = request.remote_addr

    # Log the download
    log_download(file_name, user_ip)

    return send_file(file_path, as_attachment=True)

# Function to log download details
def log_download(file_name, user_ip):
    log_entry = f"{datetime.now()} - {user_ip} downloaded {file_name}\n"
    print(f"Logging download: {log_entry}")  # Debug output
    try:
        with open(LOG_FILE, 'a') as log_file:
            log_file.write(log_entry)
        print(f"Log entry written successfully.")  # Debug output
    except Exception as e:
        print(f"Error writing log entry: {e}")  # Debug output

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    print(f"Download request received for file: {filename}")  # Debug output
    file_path = os.path.join(FILE_DIRECTORY, filename)
    
    if os.path.exists(file_path):
        user_ip = request.remote_addr
        log_download(filename, user_ip)
        print(f"File {filename} exists and is being sent to the user.")  # Debug output
        return send_file(file_path, as_attachment=True)
    else:
        print(f"File {filename} not found at path: {file_path}")  # Debug output
        abort(404, description="File not found")


# Serve the application with Waitress
if __name__ == '__main__':
    app.run()
    serve(app, host='0.0.0.0', port=8080)
