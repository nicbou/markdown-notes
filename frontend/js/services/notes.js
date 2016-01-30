//Syncs notes with the API
angular.module('notes.service').factory('$notesService', ['$rootScope', '$http', 'DEMO_MODE','$q', function($rootScope, $http, DEMO_MODE, $q){
    var notesUrl = DEMO_MODE ? '/api/v1/note-dummy/' : '/api/v1/note/',
        sharedNoteUrl = '/api/v1/shared-note/';

    function fakePromise(){
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
    }

    var timeZone = jstz.determine().name();

    var $notesService = {
        // We split notes by category, including 'unsorted' and 'trash'
        notes: {
            'unsorted': [],
            'deleted': [],
        },

        // Utility functions

        count: function(category){
            category = category || 'unsorted';
            return this.notes[category].length;
        },


        // Communication with server

        save: function(note) {
            note.title = note.title || "";
            note.date_updated = moment.utc().tz(timeZone).toJSON();

            if(DEMO_MODE){
                note.id = note.id || Math.ceil(Math.random()*10000);
                return fakePromise();
            }

            var notesService = this;
            return $http.post(notesUrl + '?format=json', note).success(function(returnedNote) {
                if(!note.id){
                    note.date_created = moment.utc(returnedNote.date_created).tz(timeZone).toJSON();
                    note.public_id = returnedNote.public_id;

                    if(note.deleted){
                        notesService.notes.deleted.push(note);
                    }
                    else{
                        notesService.notes.unsorted.push(note);
                    }
                }
                note.id = returnedNote.id;
            });
        },
        remove: function(note) {
            var notesService = this,
                deletedNotesIndex = this.notes.deleted.indexOf(note),
                allNotesindex = this.notes.unsorted.indexOf(note);

            // Note already in trash. Remove permanently.
            if(deletedNotesIndex >= 0){
                notesService.notes.deleted.splice(deletedNotesIndex, 1);
                
                if(DEMO_MODE){
                    return fakePromise();
                }
                else{
                    return $http.delete(notesUrl + note.id + '/?format=json&permanent=true');
                }
            }
            // Note not in trash. Mark as deleted.
            else if(allNotesindex >= 0){
                notesService.notes.unsorted.splice(allNotesindex, 1);
                notesService.notes.deleted.push(note);

                note.deleted = true;

                if(DEMO_MODE){
                    return fakePromise();
                }
                else{
                    return $http.delete(notesUrl + note.id + '/?format=json');
                }
            }
        },
        removeAll: function(category) {
            var notesService = this,
                noteURIs = this.notes[category].map(function(note){
                    return note.resource_uri;
                }),
                patchData = {
                    'objects': [],
                    'deleted_objects': noteURIs,
                };

                notesService.notes[category] = [];

                if(DEMO_MODE){
                    return fakePromise();
                }
                else{
                    return $http.patch(notesUrl + '?format=json&permanent=true', patchData);
                }
        },
        restore: function(note) {
            var deletedNotesIndex = this.notes.deleted.indexOf(note);

            // Move from trash to unsorted
            if(deletedNotesIndex >= 0){
                this.notes.deleted.splice(deletedNotesIndex, 1);
                this.notes.unsorted.push(note);

                note.deleted = false;
                return this.save(note);
            }
        },
        fetchFromServer: function(publicNoteId){
            var notesService = this,
                apiUrl = publicNoteId ? sharedNoteUrl + publicNoteId : notesUrl;
                apiUrl = apiUrl + '?format=json';

            return $http.get(apiUrl).then(
                function(response) {
                    if(publicNoteId){
                        notesService.notes.unsorted = [response.data];
                    }
                    else{
                        response.data.objects.forEach(function(note){
                            note.date_created = moment.utc(note.date_created).tz(timeZone).toJSON();
                            note.date_updated = note.date_created;

                            if(note.deleted){
                                notesService.notes.deleted.push(note);
                            }
                            else{
                                notesService.notes.unsorted.push(note);
                            }
                        });
                    }
                },
                angular.noop //If this is ommited, the following .then() error callbacks are ignored
            );
        }
    };

    return $notesService;
}]);