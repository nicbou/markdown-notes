//Toggles full screen mode in supported browsers
angular.module('notes.ui').directive("notebookMenuItem", function ($timeout, $document, $notebooksService, $notesService) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            scope.openSettings = function(){
                $notebooksService.notebooks.forEach(function(notebook){
                    delete notebook.settingsOpen;
                });

                scope.notebook.settingsOpen = true;
            };

            scope.toggleSettings = function(){
                if(scope.notebook.settingsOpen){
                    delete scope.notebook.settingsOpen;
                    $notebooksService.save(scope.notebook);
                }
                else{
                    scope.openSettings();
                }
            };

            scope.toggleExpanded = function(){
                scope.notebook.expanded = !scope.notebook.expanded;
                if(!scope.notebook.expanded){
                    delete scope.notebook.settingsOpen;
                }
            };
 
            var onDragOver = function (e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                element.addClass("drag-over");
            };
 
            var onDragEnd = function (e) {
                e.preventDefault();
                element.removeClass("drag-over");
            };
 
            //When a note is dropped
            var moveNote = function (e) {
                var noteString = e.dataTransfer.getData("markdownnotes/note");

                if(noteString){
                    var droppedNote = JSON.parse(noteString);

                    //Find the note, change its notebook, then save it
                    $notesService.notes.active.forEach(function(note){
                        if(note.id === droppedNote.id){
                            note.notebook_uri = scope.notebook.resource_uri;
                            $notesService.save(note);

                            if(!scope.notebook.expanded){
                                scope.toggleExpanded();
                            }
                        }
                    });
                }
            };
 
            element.bind("dragover", onDragOver);
            element.bind("dragleave", onDragEnd)
                   .bind("drop", function (e) {
                       onDragEnd(e);
                       moveNote(e);
                   });
        },
    };
});