var app = angular.module('notes', ['notes.service', 'ngRoute', 'ui.codemirror', 'ui.imagedrop', 'timeRelative']);

app.config(function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(false);
    $routeProvider
        .when('/', {
            templateUrl: '/static/js/views/main.html',
            controller: 'NotesCtrl',
            reloadOnSearch: false,
        })
        .otherwise({ redirectTo: '/' });
});

app.controller('NotesCtrl', function NotesCtrl($scope, $notesService, Uploader, $routeParams, $timeout, $interval, $location, $q, $document, $messageService){
    var saveTimeout, previewTimeout; //Tracks the preview refresh and autosave delays

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

    $scope.mathjaxOptions = {
        tex2jax: {
            inlineMath: [['$$','$$'],],
            displayMath: [['$$$','$$$'],]
        },
        showProcessingMessages: false,
        messageStyle: "none",
        showMathMenu: false,
        "HTML-CSS": { linebreaks: { automatic: true, width: "75% container" } },
    };

    $scope.cachedFormulas = {};
    $scope.currentNoteIndex = -1;
    $scope.messages = [];
    $scope.messageService = $messageService;
    $scope.notesService = $notesService;
    $scope.notesService.fetchFromServer().then(function(){
        init();
    });

    //Controller setup
    function init(){
        var currentNote = 0;

        //MatJax options (latex equations)
        MathJax.Hub.Config($scope.mathjaxOptions);
        MathJax.Hub.Configured();

        //Cache rendered formulas
        MathJax.Hub.Register.MessageHook("End Process", function (message) {
            span = $(message[1]);
            formula = span.attr('data-formula');
            output = span.html();
            $scope.cachedFormulas[formula] = output;
        });

        //Load a first note (or create one if needed)
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
            function(newValue, oldValue){
                //Save 1s after keyup
                if(saveTimeout){
                    $timeout.cancel(saveTimeout);
                }
                saveTimeout = $timeout(function(){
                    if(newValue[0] !== undefined && newValue[1] !== undefined) $scope.notesService.save($scope.notesService.notes[$scope.currentNoteIndex]);
                }, 1000);

                //Refresh the preview 200ms after keyup
                if(previewTimeout){
                    $timeout.cancel(previewTimeout);
                }
                previewTimeout = $timeout(function(){
                    $scope.updatePreview();
                }, 200);
            }
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
    }

    //Create a note
    $scope.create = function(loadCreatedNote){
        //Close the menu
        $("#side-menu, #btn-menu").removeClass("open");

        $scope.notesService.save({
            title: '',
            content: '',
        }).then(function(response){
            if(loadCreatedNote) $scope.load(response.data.id);
        });

        ga('send', 'event', 'Notes', 'Create');
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
            $("#side-menu, #btn-menu").removeClass("open");
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

        $scope.notesService.remove(note).then(function(){
            if($scope.notesService.notes.length === 0){
                $scope.create(true);
            }
            else if(isCurrentNote){
                // Don't leave the user on a deleted note. Load the next note.
                index = Math.min($scope.currentNoteIndex, $scope.notesService.notes.length-1);
                $scope.load($scope.notesService.notes[index].id, false);
            }
        });
    };

    //Updates the preview window
    $scope.updatePreview = function(){
        if($scope.notesService.notes[$scope.currentNoteIndex] === undefined) return;

        var outputWindow = $('#output');

        //Get the scroll position
        var scrollTop = outputWindow.scrollTop();

        //Convert the markup to HTML and update the preview
        var content = $scope.notesService.notes[$scope.currentNoteIndex].content;

        $('#preview').html(marked(
            content,
            {
                gfm: true,
                breaks: true,
                smartLists: true,
                highlight: function (code){return hljs.highlightAuto(code).value;}, //Code highlighting
                sanitize: true,
                renderer: customRenderer,
            }
        ));

        //Set the scroll position, since it might have been changed by loaded elements
        outputWindow.scrollTop(scrollTop);

        //Update the preview to show LaTex equations
        var counter = 0;
        $('.latex').each(function(){
            var id = 'latex-' + counter;
            $(this).attr('id', id);

            formula = $(this).attr('data-formula');
            if($scope.cachedFormulas[formula] !== undefined){
                $(this).html($scope.cachedFormulas[formula]);
            }
            else{
                MathJax.Hub.Queue(["Typeset", MathJax.Hub, id]);
            }
            counter++;
        });
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
            },
            function(imageUrl){
                error = {
                    message: 'An error occured while uploading the images.',
                    class: $scope.messageService.classes.ERROR
                };
                $scope.messageService.replace(message, error);
            }
        );

        //Clear the uploaded file
        $scope.uploadedFile = null;

        //Google analytics tracking
        ga('send', 'event', 'Notes', 'Upload', 'Image upload');
    };

    //Sets the focus on the editor
    $scope.focusEditor = function(){
        $('.CodeMirror')[0].CodeMirror.focus();
    };

    //Opens the notes menu
    $scope.toggleMenu = function(){
        $("#side-menu, #btn-menu").toggleClass("open");
    };

    //Toggle full screen mode in supported browsers
    $scope.toggleFullScreen = function(){
        if (!document.fullscreenElement && !document.mozFullScreenElement && !document.webkitFullscreenElement) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
            ga('send', 'event', 'Notes', 'Full screen');
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    };

    //Hide the preview, show only the editor
    $scope.toggleMode = function(mode){
        var main = $('#markdownnotes-wrapper');
        if(mode === 'input'){
            main.removeClass('output-only');
            main.addClass('input-only');
            ga('send', 'event', 'Notes', 'Toggle view', 'Input only');
        }
        else if(mode === 'output'){
            main.removeClass('input-only');
            main.addClass('output-only');
            ga('send', 'event', 'Notes', 'Toggle view', 'Output only');
        }
        else if(mode === 'hybrid'){
            main.removeClass('output-only');
            main.removeClass('input-only');
            ga('send', 'event', 'Notes', 'Toggle view', 'Hybrid');
        }
    };
});