FROM python:2-onbuild

RUN apt-get update && apt-get install -y \
  nodejs-legacy \
  npm 

RUN npm install -g bower

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN bower install --allow-root
RUN echo "yes" | python manage.py collectstatic
RUN python manage.py migrate

CMD python manage.py runserver 0.0.0.0:80

