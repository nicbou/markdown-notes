angular.module('notes.ui')
    .directive('news', function () {
        return {
            restrict: 'E',
            scope: {
                id: '=newsId',
                title: '=newsTitle',
                dateCreated: '='
            },
            templateUrl: '/static/js/views/news.html',
            transclude: true
        };
    });