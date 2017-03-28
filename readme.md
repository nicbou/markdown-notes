# Markdown Notes

This is the official repository for [Markdown Notes](http://markdownnotes.com).

## Application overview

Markdown Notes is a note-taking application that uses Markdown and LaTeX. You can see the application on the [Markdown Notes](http://markdownnotes.com) website.

## Architecture overview

Markdown Notes is a Django application with an AngularJS front-end.

**The back-end** consists of a simple Tastypie API to serve the notes and a bunch of simple Django views to handle the front page and user management. File uploads are stored on Amazon S3.

**The front-end** consists of an AngularJS app that binds various libraries together. The front-end code can be found in `/frontend`.

## Setting up the project

1. Install all requirements with pip: `pip install -r requirements.txt`.
2. Install the external libraries with `bower install`
3. Rename `markdown_notes/local_settings.py.template` and update it with your own settings. Some values in `settings.py` need to be set in environment variables.
4. Collect the static files with `python manage.py collectstatic`. When `DEBUG = False`, you will also need to call `python manage.py compress`.
5. Create the database with `python manage.py migrate`.
6. Run the server with `python manage.py runserver`.

### Updating from a previous version

If you have forked this project in the past (before #42), you might need to generate API keys for existing users. If you get unexplained 403 and 404 while logging in with valid user accounts, this is likely the cause of your problem.

To backfill the API keys, enter the following command:

`python manage.py backfill_api_keys`

### Deployment tools

A crude tool for automatic deployments is available. Install `forever` (`npm install -g forever`) and run `forever start webhooks.js` to have the server redeploy every time there is activity on the GitHub repo.

`deploy.sh` will pull code from the git repository, sync the database, collect static files and minimize them before restarting the server. It is used by `webhooks.js`, but can also be called manually.

## Docker

You can also build your own docker image:

1. Rename `markdown_notes/local_settings.py.template` and update it with your own settings. Some values in `settings.py` need to be set in environment variables.
2. Run `docker build -t markdown-notes .`
3. Run `docker -p 8000:80 -d markdown-notes`
4. Open your browser at [localhost:8000](http://localhost:8000)

## Get involved

You can contribute to Markdown Notes by looking at the submitted issues and sending pull requests with your fixes.
