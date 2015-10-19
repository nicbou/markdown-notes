angular.module('notes', ['notes.service', 'notes.utils', 'notes.ui', 'ngRoute', 'ui.codemirror', 'timeRelative']);
angular.module('notes.service', ['ngResource', 'notes.config']);
angular.module('notes.utils', []);
angular.module('notes.ui', []);