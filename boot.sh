#!/bin/bash
. venv/bin/activate
flask translate compile
exec gunicorn -b :5000 --access-logfile - --error-logfile - my_portfolio:app
