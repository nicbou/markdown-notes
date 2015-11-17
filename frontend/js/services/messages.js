//Syncs notes with the API
angular.module('notes.service')
    .factory('$messageService', function($timeout, $rootScope){
        var $messageService = {
            classes: {
                INFO: 'info',
                WARNING: 'warning',
                ERROR: 'error',
            },
            messages: [],
            add: function(message) {
                this.messages.push(message);
                var messageService = this;
                if(message.timeout){
                    $timeout(
                        function(){
                            messageService.messages.splice(messageService.messages.indexOf(message), 1);
                        },
                        message.timeout || 4000
                    );
                }
                $rootScope.$broadcast('messageAdded', message);
            },
            replace: function(oldMessage, newMessage) {
                this.messages.splice(this.messages.indexOf(oldMessage), 1);
                this.add(newMessage);
            },
            remove: function(message) {
                this.messages.splice(this.messages.indexOf(message), 1);
                $rootScope.$broadcast('messageRemoved', message);
            }
        };

        return $messageService;
    });