from flask import Flask, render_template, redirect, request, flash
from flask_mail import Mail, Message
from waitress import serve
from flask_babel import Babel, _

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
    "MAIL_PASSWORD": 'ahyz rgmy igtb yclg'
}
app.config.update(mail_settings)
mail = Mail(app)
babel = Babel(app)

# Configure the default locale and the default time zone
app.config['BABEL_DEFAULT_LOCALE'] = 'en'
app.config['BABEL_DEFAULT_TIMEZONE'] = 'UTC'

# Define the Contact class
class Contact:
    def __init__(self, name, email, message):
        self.name = name
        self.email = email
        self.message = message

# Define routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/send', methods=['GET', 'POST'])
def send():
    if request.method == 'POST':
        formContact = Contact(
            request.form["name"],
            request.form["email"],
            request.form["message"]
        )

        msg = Message(
            subject=f'Portfolio Contact from {formContact.name}',
            sender=app.config.get("MAIL_USERNAME"),
            recipients=['mariana.placito@gmail.com'],
            body=f'''
                _(Portfolio Contact from) {formContact.name}

                _(message:)
                {formContact.message}
            '''    
        )
        mail.send(msg)
        flash('_(Message sent successfully!)')
    return redirect('/')

# Define Locale Selection
@babel.localeselector
def get_locale():
    # You can use a request argument or user preferences to switch locale
    return request.args.get('lang') or 'en'

# Define a function to translate
def translate(lang):

# Serve the application with Waitress
if __name__ == '__main__':
    serve(app, host='0.0.0.0', port=8080)
