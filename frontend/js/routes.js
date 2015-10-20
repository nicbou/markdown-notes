angular.module('notes').config(function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(false);
    $routeProvider
        .when('/', {
            templateUrl: '/static/js/views/main.html',
            controller: 'NotesCtrl',
            reloadOnSearch: false,
        })
        .when('/:noteId/', {
            templateUrl: '/static/js/views/preview.html',
            controller: 'NotesPreviewCtrl',
            reloadOnSearch: false,
        })
        .otherwise({ redirectTo: '/' });
});