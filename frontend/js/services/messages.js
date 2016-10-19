angular.module('notes.service')
    .factory('$messageService', function($timeout, $rootScope, $sce){
        var $messageService = {
            classes: {
                INFO: 'info',
                WARNING: 'warning',
                ERROR: 'error',
            },
            messages: [],
            add: function(message) {
                message.message = $sce.trustAsHtml(message.message);

                this.messages.push(message);
                var messageService = this;
                if(message.timeout){
                    $timeout(
                        function(){
                            messageService.remove(message);
                        },
                        message.timeout
                    );
                }
                $rootScope.$broadcast('messageAdded', message);
            },
            replace: function(oldMessage, newMessage) {
                this.remove(oldMessage);
                this.add(newMessage);
            },
            remove: function(message) {
                var messageService = this;
                var messageIndex = messageService.messages.indexOf(message);
                if(messageIndex >= 0){
                    messageService.messages.splice(messageIndex, 1);
                    $rootScope.$broadcast('messageRemoved', message);
                }
            }
        };

        return $messageService;
    })
    .factory('$newsService', function ($http, $messageService) {
        var NEWS_URL = '/api/v1/news/';

        var $newsService = {
            loadNews: function () {
                return $http.get(NEWS_URL)
                    .then(function (response) {
                        return response.data.objects;
                    });
            },

            markNewsAsRead: function (id) {
                return $http.patch(NEWS_URL + id + '/read/')
                    .catch(function () {
                        $messageService.add({
                            'class': $messageService.classes.ERROR,
                            message: 'There was error when News was supposed to be marked as read.'
                        });
                    })
            }
        };

        return $newsService;
    });