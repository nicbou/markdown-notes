angular.module('notes', ['notes.service', 'notes.utils', 'notes.ui', 'ngRoute', 'ui.codemirror', 'timeRelative']);
angular.module('notes.config', []);
angular.module('notes.service', ['notes.config', 'angularModalService']);
angular.module('notes.utils', []);
angular.module('notes.ui', []);