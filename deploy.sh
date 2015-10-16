#!/bin/bash

# Get the code
git pull &&

# Install dependencies
pip install -r requirements.txt &&
bower install --allow-root &&

# Migrate database
python manage.py migrate

# Collect and compress static files
python manage.py collectstatic --noinput &&
python manage.py compress --force &&

# Restart the server
service gunicorn restart
