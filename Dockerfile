FROM python:slim

RUN useradd My_Portfolio

WORKDIR /home/My_Portfolio

COPY requirements.txt requirements.txt
RUN python -m venv venv
RUN venv/bin/pip install -r requirements.txt
RUN venv/bin/pip install gunicorn

COPY . .  
# This will copy all the files from your current directory to the Docker container

RUN chmod +x boot.sh

ENV FLASK_APP app.py

RUN chown -R My_Portfolio:My_Portfolio ./
USER My_Portfolio

EXPOSE 5000
ENTRYPOINT ["./boot.sh"]
