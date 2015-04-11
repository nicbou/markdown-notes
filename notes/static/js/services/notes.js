//Syncs notes with the API
angular.module('notes.service', ['ngResource', 'notes.config'])
    .factory('$noteProvider', ['$http','DUMMY_API','$q', function($http, DUMMY_API, $q){
        var api_url = DUMMY_API ? '/api/v1/note-dummy/' : '/api/v1/note/';

        function fakePromise(){
            var deferred = $q.defer();
            deferred.resolve();
            return deferred.promise;
        }
        
        var $noteProvider = function(data) {
            angular.extend(this, data);
        };

        $noteProvider.getAll = function() {
            return $http.get(api_url).then(function(response) {
                return response.data.objects;
            });
        };

        $noteProvider.save = function(note) {
            if(DUMMY_API){
                //Fake save operation. Assign the note a random ID, return a promise
                note.id = note.id || Math.ceil(Math.random()*10000);
                return fakePromise();
            }

            return $http.post(api_url, note).success(function(returnedNote) {
                note.id = returnedNote.id;
                note.date_updated = returnedNote.date_updated;
            });
        };

        $noteProvider.remove = function(id) {
            //Fake save operation on the dummy API
            if(DUMMY_API) return fakePromise();

            return $http.delete(api_url + id + '/');
        };

        return $noteProvider;
    }]);