//Syncs notes with the API
angular.module('notes.service')
    .factory('$messageService', function($timeout){
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
                $timeout(
                    function(){
                        messageService.messages.splice(messageService.messages.indexOf(message), 1);
                    },
                    message.timeout || 4000
                );
            },
            replace: function(oldMessage, newMessage) {
                this.messages.splice(this.messages.indexOf(oldMessage), 1);
                this.add(newMessage);
            },
            remove: function(oldMessage, newMessage) {
                this.messages.splice(this.messages.indexOf(oldMessage), 1);
            }
        };

        return $messageService;
    });