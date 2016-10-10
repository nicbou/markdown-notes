angular.module('notes.ui')
    .directive('news', function () {
        return {
            restrict: 'E',
            scope: {
                title: '=newsTitle',
                dateCreated: '=',
                onClose: '&'
            },
            templateUrl: '/static/js/views/news.html',
            transclude: true
        };
    });