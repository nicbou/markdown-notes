app.controller('NotesPreviewCtrl', function NotesCtrl($scope, $notesService, Uploader, $routeParams, $timeout, $interval, $location, $q, $document, $messageService, $rootScope, debounce){
    var saveTimeout, previewTimeout; //Tracks the preview refresh and autosave delays

    $scope.notesService = $notesService;
    $scope.notesService.fetchFromServer().then(function(){
        init();
    });

    function init(){
        $scope.note = $scope.notesService.notes[0];
        $rootScope.$broadcast('noteChanged', $scope.note);
    }

    //Saves a note then exports it to .md
    $scope.export = function(note, track){
        var blob = new Blob([note.content], {type:'text/x-markdown'});
        var fileName = note.title.toSlug(100);
        fileName = fileName.length === 0 ? "untitled note" : fileName;
        saveAs(blob, fileName + '.md'); //Uses filesaver.js

        if(track){
            //Google analytics tracking
            ga('send', 'event', 'Notes', 'Export', '.md');
        }
    };

    //Ctrl + S shortcut to export files
    $document.bind('keydown', function(event) {
        if((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase()==='s') {
            $scope.export($scope.note);
            return false;
        }
    });
});