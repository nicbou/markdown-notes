var app = angular.module('notes',['notes.service', 'uploads.service', 'ngRoute', 'ui.codemirror', 'ui.imagedrop', 'timeRelative']);

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

app.controller('NotesCtrl', function NotesCtrl($scope, $noteProvider, Uploader, $routeParams, $timeout, $interval, $location, $q, $document){
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
    $scope.messages = [];
    $scope.currentNoteIndex = -1;

    $scope.noteProvider = $noteProvider;
    $scope.noteProvider.fetchFromServer().then(function(){
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
        currentNote = parseInt($location.search('note'), 10);
        if(currentNote){
            $scope.load(currentNote);
        }
        else if($scope.noteProvider.notes.length === 0){
            $scope.create(true);
        }
        else{
            $scope.load($scope.noteProvider.notes[0].id);
        }

        $scope.$watchGroup(
            [     
                function(){
                    if($scope.currentNoteIndex >= 0 && $scope.noteProvider.notes.length > 0){
                        return $scope.noteProvider.notes[$scope.currentNoteIndex].title;
                    }
                },   
                function(){
                    if($scope.currentNoteIndex >= 0 && $scope.noteProvider.notes.length > 0){
                        return $scope.noteProvider.notes[$scope.currentNoteIndex].content;
                    }
                },
            ],
            function(newValue, oldValue){
                //Save 1s after keyup
                if(saveTimeout){
                    $timeout.cancel(saveTimeout);
                }
                saveTimeout = $timeout(function(){
                    if(newValue !== undefined) $scope.noteProvider.save($scope.noteProvider.notes[$scope.currentNoteIndex]);
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

        $interval(
            function(){
                $location.search('note', $scope.noteProvider.notes[$scope.currentNoteIndex].id);
            },
            500
        );
    }

    //Create a note
    $scope.create = function(loadCreatedNote){
        //Close the menu
        $("#notes-menu, #btn-menu").removeClass("open");

        $scope.noteProvider.save({
            title: '',
            content: '',
            date_created: (new Date()).toISOString(),
        }).then(function(response){
            if(loadCreatedNote) $scope.load(response.data.id);
        });
    };

    //Loads a note from the server
    $scope.load = function(noteId, hideMenu){
        var noteFound = false;
        hideMenu = hideMenu === undefined ? true : false;

        //Load an existing note
        for(var i=0; i<$scope.noteProvider.notes.length; i++){
            if($scope.noteProvider.notes[i].id === noteId){
                $scope.currentNoteIndex = i;
                noteFound = true;
            }
        }

        if(!noteFound){
            //TODO
        }

        if(hideMenu){
            $("#notes-menu, #btn-menu").removeClass("open");
        }
    };
    //Preserves ctrl+clicking to open notes in a new tab
    $scope.loadFromMenu = function($event, noteId, hideMenu){
        if($event.ctrlKey != 1 && $event.metaKey != 1){
            $event.preventDefault();
            $scope.load(noteId);
        }
    };

    //Saves a note then exports it to .md
    $scope.export = function(note){
        var blob = new Blob([note.content], {type:'text/x-markdown'});
        var fileName = note.title.toSlug(100);
        fileName = fileName.length === 0 ? "untitled note" : fileName;
        saveAs(blob, fileName + '.md'); //Uses filesaver.js
    };

    //Ctrl + S shortcut to export files
    $document.bind('keydown', function(event) {
        if((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase()==='s') {
            $scope.export($scope.noteProvider.notes[$scope.currentNoteIndex]);
            return false;
        }
    });

    //Deletes a note from the list
    $scope.remove = function(note){
        var index,
            isCurrentNote = note.id === $scope.noteProvider.notes[$scope.currentNoteIndex].id;

        $scope.noteProvider.remove(note).then(function(){
            if($scope.noteProvider.notes.length === 0){
                $scope.create(true);
            }
            else if(isCurrentNote){
                // Don't leave the user on a deleted note. Load the next note.
                index = Math.min($scope.currentNoteIndex, $scope.noteProvider.notes.length-1);
                $scope.load($scope.noteProvider.notes[index].id, false);
            }
        });
    };

    //Updates the preview window
    $scope.updatePreview = function(){
        if($scope.noteProvider.notes[$scope.currentNoteIndex] === undefined) return;

        var outputWindow = $('#output');

        //Get the scroll position
        var scrollTop = outputWindow.scrollTop();

        //Convert the markup to HTML and update the preview
        var content = $scope.noteProvider.notes[$scope.currentNoteIndex].content;

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

    function uploadImage(){

        var message = {
            'message':'Uploading image...',
            'class':'info'
        };
        $scope.messages.push(message);

        //Upload the image
        Uploader.uploadImage($scope.uploadedFile, $scope.currentNoteIndex).then(
            function(imageUrl){
                var markdownImage = '![](' + imageUrl + ')';

                //Insert at cursor in the editor
                $('.CodeMirror')[0].CodeMirror.replaceSelection(markdownImage);
                
                //Delete the "uploading" message
                $scope.messages.splice($scope.messages.indexOf(message), 1);
            },
            function(imageUrl){
                //Replace the message by an error
                $scope.messages.splice($scope.messages.indexOf(message), 1);
                error = {
                    'message':'An error occured while uploading the images.',
                    'class':'error'
                };
                $scope.messages.push(error);
                $timeout(
                    function(){
                        $scope.messages.splice($scope.messages.indexOf(error), 1);
                    },
                    4000
                );
            }
        );

        //Clear the uploaded file
        $scope.uploadedFile = null;
    }

    //Sets the focus on the editor
    $scope.focusEditor = function(){
        $('.CodeMirror')[0].CodeMirror.focus();
    };

    //Opens the notes menu
    $scope.toggleMenu = function(){
        $("#notes-menu, #btn-menu").toggleClass("open");
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
        var main = $('body');
        if(mode === 'input'){
            main.removeClass('output-only');
            main.addClass('input-only');
        }
        else if(mode === 'output'){
            main.removeClass('input-only');
            main.addClass('output-only');
        }
        else if(mode === 'hybrid'){
            main.removeClass('output-only');
            main.removeClass('input-only');
        }
    };
});