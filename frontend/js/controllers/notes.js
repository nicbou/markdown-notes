angular.module('notes').controller('NotesCtrl', function NotesCtrl($scope, $window, $notesService, Uploader, $routeParams, $timeout, $interval, $location, $q, $document, $messageService, $rootScope, debounce, DEMO_MODE){

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
    };

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
        else if($scope.notesService.notes.length === 0){
            $scope.create(true);
        }
        else{
            $scope.load($scope.notesService.notes[0].id);
        }

        // Monitor note changes
        $scope.$watchGroup(
            [     
                function(){
                    if($scope.currentNoteIndex >= 0 && $scope.notesService.notes.length > 0){
                        return $scope.notesService.notes[$scope.currentNoteIndex].title;
                    }
                },   
                function(){
                    if($scope.currentNoteIndex >= 0 && $scope.notesService.notes.length > 0){
                        return $scope.notesService.notes[$scope.currentNoteIndex].content;
                    }
                },
            ],
            debounce(function(newValue, oldValue){
                if(newValue && newValue[0] !== undefined && newValue[1] !== undefined){
                    $scope.notesService.save($scope.notesService.notes[$scope.currentNoteIndex]).catch($scope.handleNetworkError);
                }
                $rootScope.$broadcast('noteChanged', $scope.notesService.notes[$scope.currentNoteIndex]);
            }, 200)
        );

        // Load the right note based on the note ID in the URL if it's updated elsewhere
        $scope.$on('$routeUpdate', function(){
            var currentNoteId = $scope.notesService.notes[$scope.currentNoteIndex].id;
            if($location.search().note){
                if(currentNoteId !== +$location.search().note){
                    $scope.load(+$location.search().note);
                }
            }
            else{
                $location.search('note', $scope.notesService.notes[$scope.currentNoteIndex].id);
            }
        });

        if(!DEMO_MODE && !localStorage.getItem('introMessageDismissed')){
            // Show a promotional message at load
            var introMessages = [
                    "Hello! {a}Are you hiring a developer?{/a}",
                    "Hello! {a}Are you looking for a developer?{/a}",
                    "The creator of Markdown Notes {a}needs a small favor{/a}",
                    "Hello! I created Markdown Notes and {a}I need a small favor{/a}",
                    "Hello! I created Markdown Notes and {a}I am looking for a job{/a}",
                    "The creator of Markdown Notes {a}is looking for a job{/a}",
                    "Hiring in Berlin? {a}I need a small favor{/a}",
                ],
                introMessageText = introMessages[Math.floor(Math.random()*introMessages.length)], //Pick a random one
                aElement = '<a href="http://markdownnotes.com/app/#/1daghcj/" target="_blank" onclick="ga(\'send\', \'event\', \'Shameless plug\', \'Clicked\', \'' + introMessageText + '\')">',
                introMessage = introMessageText.replace('{/a}', '</a>').replace('{a}', aElement);

            $scope.messageService.add({
                message: introMessage, //Pick a random message
                class: $scope.messageService.classes.INFO,
                id: 'shamelessPlug', //not used by the service
                track: true,
            });
            ga('send', 'event', 'Shameless plug', 'Displayed', introMessageText);

            $rootScope.$on('messageRemoved', function(e, message){
                if(message.id === 'shamelessPlug'){
                    ga('send', 'event', 'Shameless plug', 'Dismissed', message.message);
                    localStorage.setItem('introMessageDismissed', true);
                }
            });
        }
    }

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
        for(var i=0; i<$scope.notesService.notes.length; i++){
            if($scope.notesService.notes[i].id === noteId){
                $scope.currentNoteIndex = i;
                noteFound = true;
            }
        }

        if(!noteFound){
            $scope.currentNoteIndex = 0;
        }
        $location.search('note', $scope.notesService.notes[$scope.currentNoteIndex].id);

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
            $scope.export($scope.notesService.notes[$scope.currentNoteIndex]);
            return false;
        }
    });

    //Deletes a note from the list
    $scope.remove = function(note){
        var index,
            isCurrentNote = note.id === $scope.notesService.notes[$scope.currentNoteIndex].id;

        $scope.notesService.remove(note).then(
            function(){
                if($scope.notesService.notes.length === 0){
                    $scope.create(true);
                }
                else if(isCurrentNote){
                    // Don't leave the user on a deleted note. Load the next note.
                    index = Math.min($scope.currentNoteIndex, $scope.notesService.notes.length-1);
                    $scope.load($scope.notesService.notes[index].id, false);
                }
            },
            $scope.handleNetworkError
        );
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
        Uploader.uploadImage($scope.uploadedFile, $scope.notesService.notes[$scope.currentNoteIndex]).then(
            function(imageUrl){
                var markdownImage = '![](' + imageUrl + ')';

                //Insert at cursor in the editor
                $('.CodeMirror')[0].CodeMirror.replaceSelection(markdownImage);
                
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
        $('.CodeMirror')[0].CodeMirror.focus();
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