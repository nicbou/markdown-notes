#!/bin/bash

# Get the code
git pull &&

# Install dependencies
pip install -r requirements.txt &&
bower install --allow-root &&

# Migrate database
python manage.py migrate &&

# Collect and compress static files
python manage.py collectstatic --noinput &&
python manage.py compress --force &&

# Restart the server
service gunicorn restart &&

# Send pushover notification
curl -s \
  --form-string "user=u4bYavyUXyk5oUppeR6TA6mnhJn5dM" \
  --form-string "token=anCEaKMXmbDqx8YvEqaY4BCN3qogUn" \
  --form-string "message=Markdown Notes deployment successful" \
  https://api.pushover.net/1/messages.json
