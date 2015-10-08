var app = angular.module('notes', ['notes.service', 'notes.utils', 'notes.ui', 'ngRoute', 'ui.codemirror', 'timeRelative']);

app.config(function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(false);
    $routeProvider
        .when('/', {
            templateUrl: '/static/js/views/main.html',
            controller: 'NotesCtrl',
            reloadOnSearch: false,
        })
        .when('/share/:noteId', {
            templateUrl: '/static/js/views/preview.html',
            controller: 'NotesPreviewCtrl',
            reloadOnSearch: false,
        })
        .otherwise({ redirectTo: '/' });
});