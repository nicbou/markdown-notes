angular.module('notes').controller('NotesCtrl', function NotesCtrl($scope, $window, $notesService, Uploader, $routeParams, $timeout, $interval, $location, $q, $document, $messageService, $rootScope, debounce, DEMO_MODE){

    $scope.currentNoteIndex = -1;
    $scope.messages = [];
    $scope.messageService = $messageService;
    $scope.notesService = $notesService;
    $scope.notesService.fetchFromServer().then(
        function(){
            init();
        },
        $scope.handleNetworkError
    );

    $scope.sideMenuOpen = false;

    $scope.MODE_INPUT_ONLY = 'input-only';
    $scope.MODE_OUTPUT_ONLY = 'output-only';
    $scope.MODE_HYBRID = 'hybrid';
    $scope.displayMode = $scope.MODE_HYBRID;

    //Controller setup
    function init(){
        var currentNote = 0;

        // Load a first note (or create one if needed)
        currentNote = parseInt($location.search().note, 10);
        if(currentNote){
            $scope.load(currentNote);
        }
        else if($scope.notesService.count() === 0){
            $scope.create(true);
        }
        else{
            $scope.load($scope.notesService.notes.unsorted[0].id);
        }

        // Monitor note changes
        $scope.$watchGroup(
            [     
                function(){
                    if($scope.currentNoteIndex >= 0 && $scope.notesService.count() > 0){
                        return $scope.notesService.notes.unsorted[$scope.currentNoteIndex].title;
                    }
                },   
                function(){
                    if($scope.currentNoteIndex >= 0 && $scope.notesService.count() > 0){
                        return $scope.notesService.notes.unsorted[$scope.currentNoteIndex].content;
                    }
                },
            ],
            debounce(function(newValue, oldValue){
                if(newValue && newValue[0] !== undefined && newValue[1] !== undefined){
                    $scope.notesService.save($scope.notesService.notes.unsorted[$scope.currentNoteIndex]).catch($scope.handleNetworkError);
                }
                $rootScope.$broadcast('noteChanged', $scope.notesService.notes.unsorted[$scope.currentNoteIndex]);
            }, 200)
        );

        // Load the right note based on the note ID in the URL if it's updated elsewhere
        $scope.$on('$routeUpdate', function(){
            var currentNoteId = $scope.notesService.notes.unsorted[$scope.currentNoteIndex].id;
            if($location.search().note){
                if(currentNoteId !== +$location.search().note){
                    $scope.load(+$location.search().note);
                }
            }
            else{
                $location.search('note', $scope.notesService.notes.unsorted[$scope.currentNoteIndex].id);
            }
        });
    }

    $scope.bindEditor = function(editor){
        //Prevents Ctrl+Z'ing back into the previous note
        $scope.$watch('currentNoteIndex', function(newId, oldId){
            editor.getDoc().clearHistory();
        });
    };

    $scope.codemirrorOptions = {
        dragDrop: false, //Disabled so the window receives the event
        foldGutter: true, //Code folding
        foldOptions: {'widget': '▾' },
        gutters: ["CodeMirror-foldgutter"],
        indentUnit: 4,
        indentWithTabs: true,
        lineWrapping: true,
        matchBrackets: true,
        mode: 'gfm-latex',
        tabindex: 2,
        viewportMargin: Infinity,
        widget: '',

        onLoad: $scope.bindEditor,
    };

    //Create a note
    $scope.create = function(loadCreatedNote){
        //Close the menu
        $scope.sideMenuOpen = false;

        $scope.notesService.save({title:'', content:''}).then(
            function(response){
                if(response && response.data && loadCreatedNote){
                    $scope.load(response.data.id);
                }
                ga('send', 'event', 'Notes', 'Create');
            },
            $scope.handleNetworkError
        );
    };

    //Loads a note from the server
    $scope.load = function(noteId, hideMenu){
        var noteFound = false;
        hideMenu = hideMenu === undefined ? true : false;

        //Load an existing note
        for(var i=0; i<$scope.notesService.count(); i++){
            var note = $scope.notesService.notes.unsorted[i];
            if(note.id === noteId && !note.deleted){
                $scope.currentNoteIndex = i;
                noteFound = true;
            }
        }

        if(!noteFound){
            $scope.currentNoteIndex = 0;
        }
        $location.search('note', $scope.notesService.notes.unsorted[$scope.currentNoteIndex].id);

        if(hideMenu){
            $scope.sideMenuOpen = false;
        }
        
        return noteFound;
    };
    //Preserves ctrl+clicking to open notes in a new tab
    $scope.loadFromMenu = function($event, noteId, hideMenu){
        if($event.ctrlKey != 1 && $event.metaKey != 1){
            $event.preventDefault();
            $scope.load(noteId);
        }
    };

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
            $scope.export($scope.notesService.notes.unsorted[$scope.currentNoteIndex]);
            return false;
        }
    });

    //Returns a value on which notes are sorted
    $scope.noteRanker = function(note){
        return -moment(note.date_updated).valueOf(); //Most recent first
    };
    //Sorts notes based on $scope.noteRanker values, but send the deleted ones at the end
    $scope.noteSorter = function(note1, note2){
        if(note1.deleted && !note2.deleted){
            return 1;
        }
        else if(!note1.deleted && note2.deleted){
            return -1;
        }
        else{
            return $scope.noteRanker(note1) - $scope.noteRanker(note2);
        }
    };

    //Deletes a note from the list, loads the next one in the list
    $scope.remove = function(note){
        var isCurrentNote = note.id === $scope.notesService.notes.unsorted[$scope.currentNoteIndex].id,
            nextNoteId = $scope.notesService.notes.unsorted[$scope.currentNoteIndex].id;

        // Don't leave the user on a deleted note. Load the next note.
        if(isCurrentNote){
            //The notes in notesService are in arbitrary order, while those in the menu are sorted
            //based on $scope.noteRanker. When deleting a note, we load the next one in the menu,
            //not necessarily the next one in notesService.notes.
            var sortedNotes = $scope.notesService.notes.unsorted.slice().sort($scope.noteSorter),
                indexInSortedNotes = sortedNotes.indexOf(note),
                isLastInList = indexInSortedNotes === sortedNotes.length-1, //If deleting the last note, load the next-to-last note
                nextNoteIndex = isLastInList ? indexInSortedNotes-1 : indexInSortedNotes+1;

            if(nextNoteIndex >= 0){ //Happens when deleting the only note left
                nextNoteId = sortedNotes[nextNoteIndex].id;
            }
        }

        $scope.notesService.remove(note).then(
            function(){
                //If we deleted the last note, create a new one
                if($scope.notesService.count() === 0){
                    $scope.create(true);
                }
                //Update the currentNoteIndex, since the array changed
                else{
                    $scope.load(nextNoteId, false);
                }
            },
            $scope.handleNetworkError
        );
    };

    $scope.restore = function(note){
        $scope.notesService.restore(note);
        ga('send', 'event', 'Notes', 'Trash', 'Restore note');
    };

    $scope.emptyTrash = function(){
        $scope.notesService.removeAll('deleted');
        ga('send', 'event', 'Notes', 'Trash', 'Empty trash');
    };

    $scope.uploadImage = function(){
        var error,
            message = {
                message: 'Uploading image...',
                class: $scope.messageService.classes.INFO,
                timeout: 8000,
            };
        $scope.messageService.add(message);

        //Upload the image
        Uploader.uploadImage($scope.uploadedFile, $scope.notesService.notes.unsorted[$scope.currentNoteIndex]).then(
            function(imageUrl){
                var markdownImage = '![](' + imageUrl + ')';

                //Insert at cursor in the editor
                document.getElementsByClassName('CodeMirror')[0].CodeMirror.replaceSelection(markdownImage);
                
                //Delete the "uploading" message
                $scope.messageService.remove(message);

                ga('send', 'event', 'Notes', 'Upload', 'Image upload');
            },
            function(){
                error = {
                    message: 'An error occured while uploading the images.',
                    class: $scope.messageService.classes.ERROR,
                    timeout: 5000,
                };
                $scope.messageService.replace(message, error);
            }
        );

        //Clear the uploaded file
        $scope.uploadedFile = null;
    };

    //Sets the focus on the editor
    $scope.focusEditor = function(){
        document.getElementsByClassName('CodeMirror')[0].CodeMirror.focus();
    };

    $rootScope.$on('fullScreen', function(){
        ga('send', 'event', 'Notes', 'Full screen');
    });

    //Hide the preview, show only the editor
    $scope.toggleMode = function(mode){
        $scope.displayMode = mode;
        if(mode === $scope.MODE_INPUT_ONLY){
            ga('send', 'event', 'Notes', 'Toggle view', 'Input only');
        }
        else if(mode === $scope.MODE_OUTPUT_ONLY){
            ga('send', 'event', 'Notes', 'Toggle view', 'Output only');
        }
        else if(mode === $scope.MODE_HYBRID){
            ga('send', 'event', 'Notes', 'Toggle view', 'Hybrid');
        }
    };

    $scope.handleNetworkError = function(err){
        if(err.status === 401){
            $window.location.href = '/auth/login/';
        }
        else{
            $scope.messageService.add({
                message: 'An error occured while saving the note.',
                class: $scope.messageService.classes.ERROR,
                timeout: 5000
            });
        }
    };
});