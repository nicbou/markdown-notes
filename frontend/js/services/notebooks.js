//Syncs notes with the API
angular.module('notes.service').factory('$notebooksService', ['$rootScope', '$http', 'DEMO_MODE','$q', function($rootScope, $http, DEMO_MODE, $q){
    var notebooksUrl = DEMO_MODE ? '/api/v1/notebook-dummy/' : '/api/v1/notebook/';

    function fakePromise(){
        var deferred = $q.defer();
        deferred.resolve();
        return deferred.promise;
    }

    var $notebooksService = {
        notebooks: [],

        // Communication with server

        save: function(notebook) {
            notebook.title = notebook.title || "";

            if(DEMO_MODE){
                notebook.id = notebook.id || Math.ceil(Math.random()*10000);
                return fakePromise();
            }

            var notebooksService = this;
            return $http.post(notebooksUrl + '?format=json', notebook).success(function(returnedNotebook) {
                if(!notebook.id){
                    notebooksService.notebooks.push(notebook);
                }
                notebook.id = returnedNotebook.id;
                notebook.resource_uri = returnedNotebook.resource_uri;
            });
        },
        delete: function(notebook) {
            var notebooksService = this,
                notebookIndex = this.notebooks.indexOf(notebook);

            if(notebookIndex >= 0){
                notebooksService.notebooks.splice(notebookIndex, 1);
                
                if(DEMO_MODE){
                    return fakePromise();
                }
                else{
                    return $http.delete(notebooksUrl + notebook.id + '/?format=json');
                }
            }
        },
        fetchFromServer: function(){
            var notebooksService = this;

            return $http.get(notebooksUrl + '?format=json').then(
                function(response) {
                    notebooksService.notebooks = response.data.objects;
                },
                angular.noop //If this is ommited, the following .then() error callbacks are ignored
            );
        }
    };

    return $notebooksService;
}]);