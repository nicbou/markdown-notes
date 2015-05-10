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

app.controller('NotesCtrl', function NotesCtrl($scope, $noteProvider, Uploader, $routeParams, $timeout, $location, $q, $document){
    //Used to keep track of the preview refresh and autosave delay
    var saveTimeout = null;
    var saveTimeoutDelay = 200; //200ms after edit before preview refresh

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

    //Get all the notes, including the current one, then setup the controller
    $noteProvider.getAll().then(
        function(notes){
            $scope.notes = notes;

            //Set the current note if an ID is specified
            if($location.search().note){
                $scope.load($location.search().note);
            }
            else if($scope.notes.length > 0){
                //Load the latest note if possible
                $scope.load($scope.notes[0].id);
            }

            //If no note is loaded, init will create and save one "on change"
            init();
        }
    );

    //Controller setup
    function init(){
        $scope.messages = [];

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

        //Set a default currentNote if none is loaded
        if(!$scope.currentNote){
            $scope.currentNote = {
                title: '',
                content: '',
                date_created: (new Date()).toISOString(),
            };
        }
        $scope.updatePreview();

        //Update the preview on content/title changes
        $scope.$watch('currentNote', function(newVal, oldVal, scope) {
            //Refresh the preview 200ms after keyup
            if(saveTimeout){
                $timeout.cancel(saveTimeout);
            }
            saveTimeout = $timeout(function(){
                if(newVal.title !== oldVal.title || newVal.content !== oldVal.content){
                    if(newVal.id === oldVal.id || newVal.id === null){
                        scope.save(scope.currentNote).then(function(){
                            //Update the ID in the URL after saving the note
                            $location.search('note', scope.currentNote.id);
                        });
                    }
                    else{
                        //Update the ID in the URL after a note switch/creation
                        $location.search('note', scope.currentNote.id);
                    }
                    scope.updatePreview();
                }
            }, saveTimeoutDelay);
        }, true);
    }

    //Create a note
    $scope.create = function(){
        //Create the note
        $scope.currentNote = {
            title: '',
            content: '',
            date_created: (new Date()).toISOString(),
        };

        //Close the menu
        $("#notes-menu, #btn-menu").removeClass("open");
    };

    //Loads a note from the server
    $scope.load = function(noteId, hideMenu){
        hideMenu = hideMenu === undefined ? true : false;

        //Load an existing note
        for(var i=0; i<$scope.notes.length; i++){
            if($scope.notes[i].id.toString() == noteId){
                $scope.currentNote = $scope.notes[i];
            }
        }

        if(!$scope.currentNote){
            //TODO: Note not found!
        }

        //Close the menu
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

    //Saves a note, updates the ID in the querystring. This function is a promise, so you can call .save().then()
    $scope.save = function(note){
        var deferred = $q.defer();

        note.title = note.title || "";

        //Add the note to the menu if necessary
        if(!$scope.currentNote.id){
            $scope.notes.unshift($scope.currentNote);
        }

        //Save the note, update the date
        $noteProvider.save(note).then(
            function(){
                deferred.resolve(note);
            }
        );

        return deferred.promise;
    };

    //Saves a note then exports it to .md
    $scope.export = function(note){
        var blob = new Blob([note.content], {type:'text/x-markdown'});
        var fileName = note.title.toSlug(100);
        fileName = fileName.length == 0 ? "untitled note" : fileName;
        saveAs(blob, fileName + '.md'); //Uses filesaver.js
    };

    //Ctrl + S shortcut to export files
    $document.bind('keydown', function(event) {
        if((event.ctrlKey || event.metaKey) && String.fromCharCode(event.which).toLowerCase()==='s') {
            $scope.export($scope.currentNote);
            return false;
        }
    });

    //Deletes a note from the list
    $scope.remove = function(note){
        $noteProvider.remove(note.id);

        //Remove the note from the list
        $scope.notes.splice($scope.notes.indexOf(note), 1);

        //Don't leave the user on an undeleted note
        if(note.id === $scope.currentNote.id){
            //Try loading the first note, or create one as a fallback
            if($scope.notes.length > 0){
                $scope.load($scope.notes[0].id, false);
            }
            else{
                $scope.create();
            }
        }
    };

    //Updates the preview window
    $scope.updatePreview = function(){
        var outputWindow = $('#output');

        //Get the scroll position
        var scrollTop = outputWindow.scrollTop();

        //Convert the markup to HTML and update the preview
        var content = $scope.currentNote.content;

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

    //Drop uploads
    $scope.imageDropped = function(){
        //Save the note if it's new
        if(!$scope.currentNote.id){
            var message = {
                'message':'Saving note...',
                'class':'info'
            };
            $scope.messages.push(message);

            $scope.save($scope.currentNote).then(function(){
                $scope.messages.splice($scope.messages.indexOf(message), 1);
                uploadImage();
            });
        }
        else{
            uploadImage();
        }
    };

    function uploadImage(){

        var message = {
            'message':'Uploading image...',
            'class':'info'
        };
        $scope.messages.push(message);

        //Upload the image
        Uploader.uploadImage($scope.uploadedFile, $scope.currentNote.id).then(
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