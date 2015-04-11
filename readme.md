#Markdown Notes

This is the official repository for [Markdown Notes](http://markdownnotes.com).

##Application overview

Markdown Notes is a note-taking application that uses Markdown and LaTeX. You can see the application on the [Markdown Notes](http://markdownnotes.com) website. The project is hosted on Heroku.

##Architecture overview

Markdown Notes is a Django application with an AngularJS front-end.

**The back-end** consists of a simple Tastypie API to serve the notes and a bunch of simple Django views to handle the front page and user management.

**The front-end** consists of an AngularJS app that binds various libraries together. The front-end code can be found in `/notes/static`.

##Setting up the project

1. Install all requirements with pip: `pip install -r requirements.txt`.
2. Rename `markdown_notes/local_settings.py.template` and update it with your own settings.
3. Sync the database with `python manage.py syncdb`.
4. Run the server with `python manage.py runserver`.

##Get involved

You can contribute to Markdown Notes by looking at the submitted issues and sending pull requests with your fixes.