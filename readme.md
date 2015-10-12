#Markdown Notes

This is the official repository for [Markdown Notes](http://markdownnotes.com).

##Application overview

Markdown Notes is a note-taking application that uses Markdown and LaTeX. You can see the application on the [Markdown Notes](http://markdownnotes.com) website.

##Architecture overview

Markdown Notes is a Django application with an AngularJS front-end.

**The back-end** consists of a simple Tastypie API to serve the notes and a bunch of simple Django views to handle the front page and user management. File uploads are stored on Amazon S3.

**The front-end** consists of an AngularJS app that binds various libraries together. The front-end code can be found in `/frontend`.

##Setting up the project

1. Install all requirements with pip: `pip install -r requirements.txt`.
2. Install the external libraries with `bower install`
3. Rename `markdown_notes/local_settings.py.template` and update it with your own settings. Some values in `settings.py` need to be set in environment variables.
4. Download the static files with `python manage.py collectstatic` 
5. Sync the database with `python manage.py syncdb`.
6. Run the server with `python manage.py runserver`.

##Get involved

You can contribute to Markdown Notes by looking at the submitted issues and sending pull requests with your fixes.
