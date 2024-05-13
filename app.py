from flask import Flask, render_template, redirect, request, flash
from flask_mail import Mail, Message
from config import email, senha

app = Flask(__name__)
app.secret_key = 'marip'

mail_settings = {
    "MAIL_SERVER": 'smtp.gmail.com',
    "MAIL_PORT": 465,
    "MAIL_USE_TLS": False,
    "MAIL_USE_SSL": True,
    "MAIL_USERNAME": email,
    "MAIL_PASSWORD": senha
}

app.config.update(mail_settings)
mail = Mail(app)

class Contact:
    def __init__(self, name, email, message):
        self.name = name
        self.email = email
        self.message = message

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
            subject = f'Portfolio Contact from {formContact.name}',
            sender = app.config.get("MAIL_USERNAME"),
            recipients = ['mariana.placito@gmail.com'],
            body = f'''
                Portfolio Contact from {formContact.name}

                message:
                {formContact.message}
            '''    
        )
        mail.send(msg)
        flash('Message sent successfully!')
    return redirect('/')

if __name__ == '__main__':
    app.run(debug=True)