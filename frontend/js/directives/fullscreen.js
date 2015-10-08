//Toggles full screen mode in supported browsers
angular.module('notes.ui', [])
.directive("fullscreen", function ($document, $rootScope) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            element.on('click', function(){
                if (!$document.fullscreenElement && !$document.mozFullScreenElement && !$document.webkitFullscreenElement) {
                    if ($document.documentElement.requestFullscreen) {
                        $document.documentElement.requestFullscreen();
                    } else if ($document.documentElement.mozRequestFullScreen) {
                        $document.documentElement.mozRequestFullScreen();
                    } else if ($document.documentElement.webkitRequestFullscreen) {
                        $document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
                    }
                    $rootScope.$broadcast('fullScreen');
                } else {
                    if ($document.cancelFullScreen) {
                        $document.cancelFullScreen();
                    } else if ($document.mozCancelFullScreen) {
                        $document.mozCancelFullScreen();
                    } else if ($document.webkitCancelFullScreen) {
                        $document.webkitCancelFullScreen();
                    }
                }
            });
        }
    };
});