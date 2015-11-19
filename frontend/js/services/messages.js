//Syncs notes with the API
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
                            var messageIndex = messageService.messages.indexOf(message);
                            if(messageIndex >= 0){
                                messageService.messages.splice(messageIndex, 1);
                            }
                        },
                        message.timeout
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