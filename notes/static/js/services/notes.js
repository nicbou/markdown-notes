//Syncs notes with the API
angular.module('notes.service', ['ngResource', 'notes.config'])
    .factory('$noteProvider', ['$rootScope', '$http', 'DUMMY_API','$q', function($rootScope, $http, DUMMY_API, $q){
        var api_url = DUMMY_API ? '/api/v1/note-dummy/' : '/api/v1/note/';

        var $notesProvider = {
            notes: [],
            save: function(note) {
                note.title = note.title || "";

                if(DUMMY_API){
                    //Fake save operation. Assign the note a random ID, return a promise
                    note.id = note.id || Math.ceil(Math.random()*10000);
                    return fakePromise();
                }

                var noteProvider = this;
                return $http.post(api_url, note).success(function(returnedNote) {
                    if(!note.id){
                        noteProvider.notes.push(note);
                    }
                    note.id = returnedNote.id;
                });
            },
            remove: function(note) {
                var index = this.notes.indexOf(note);

                if(index >= 0){
                    if(DUMMY_API) return fakePromise();

                    var noteProvider = this;
                    return $http.delete(api_url + note.id + '/').success(function(){
                        noteProvider.notes.splice(index, 1);
                    });
                }
            },
            fetchFromServer: function(){
                var noteProvider = this;
                return $http.get(api_url).then(function(response) {
                    noteProvider.notes = response.data.objects;
                });
            }
        };

        return $notesProvider;
    }]);