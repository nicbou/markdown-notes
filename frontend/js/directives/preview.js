//Toggles full screen mode in supported browsers
angular.module('notes.ui').directive("preview", function ($rootScope) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            scope.cachedFormulas = {};

            //MatJax options (latex equations)
            MathJax.Hub.Config({
                tex2jax: {
                    inlineMath: [['$$','$$'],],
                    displayMath: [['$$$','$$$'],]
                },
                showProcessingMessages: false,
                messageStyle: "none",
                showMathMenu: false,
                "HTML-CSS": { linebreaks: { automatic: true, width: "75% container" } },
            });
            MathJax.Hub.Configured();

            //Cache rendered formulas
            MathJax.Hub.Register.MessageHook("End Process", function(message) {
                span = angular.element(message[1]);
                formula = span.attr('data-formula');
                output = span.html();
                scope.cachedFormulas[formula] = output;
            });

            $rootScope.$on('noteChanged', function(e, note){
                if(note === undefined) return;

                var outputWindow = element.parent();

                //Get the scroll position
                var scrollTop = outputWindow.scrollTop;

                //Convert the markup to HTML and update the preview
                var content = note.content;

                element.html(marked(
                    content,
                    {
                        gfm: true,
                        breaks: true,
                        smartLists: true,
                        highlight: function(code, lang){
                            if(lang){
                                return hljs.highlight(lang, code).value;
                            }
                            return hljs.highlightAuto(code).value;
                        }, //Code highlighting
                        sanitize: true,
                        renderer: customRenderer,
                    }
                ));

                //Set the scroll position, since it might have been changed by loaded elements
                outputWindow.scrollTop = scrollTop;

                //Update the preview to show LaTex equations
                var counter = 0;
                var elements = document.getElementsByClassName('latex');
                [].forEach.call(elements, function(el){  //HTMLCollection doesn't support forEach
                    var id = 'latex-' + counter,
                        element = angular.element(el);
                    
                    element.attr('id', id);

                    formula = element.attr('data-formula');
                    if(scope.cachedFormulas[formula] !== undefined){
                        element.html(scope.cachedFormulas[formula]);
                    }
                    else{
                        MathJax.Hub.Queue(["Typeset", MathJax.Hub, id]);
                    }
                    counter++;
                });
                
            });
        }
    };
});