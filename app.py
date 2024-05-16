from flask import Flask, current_app, render_template, redirect, request, flash, session, url_for, jsonify, send_file
from flask_mail import Mail, Message
from waitress import serve
from flask_babel import Babel, gettext as _
import os

# Initialize the Flask application first
app = Flask(__name__)
app.secret_key = 'marip'

# Set up mail settings
mail_settings = {
    "MAIL_SERVER": 'smtp.gmail.com',
    "MAIL_PORT": 465,
    "MAIL_USE_TLS": False,
    "MAIL_USE_SSL": True,
    "MAIL_USERNAME": 'teest4geeks12@gmail.com',
    "MAIL_PASSWORD": 'ahy2 rgmy igtb yclg'
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
def get_locale():
    return request.accept_languages.best_match(current_app.config['BABEL_SUPPORTED_LOCALES'])

# Define routes
@app.route('/')
def home():
    return render_template('index.html', lang=get_locale())

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

# Serve the application with Waitress
if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=8080)
