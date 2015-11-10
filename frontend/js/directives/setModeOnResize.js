//Disables the editor+preview mode on small screens
angular.module('notes.ui').directive('setModeOnResize', function ($window, $timeout) {
    return function (scope, element) {
        var w = angular.element($window);

        w.bind('resize', function(){   
            if(w.width() < 768 && scope.displayMode === scope.MODE_HYBRID){
                scope.displayMode = scope.MODE_INPUT_ONLY;
                scope.$apply();
            }
        });

        //Initial size
        $timeout(function(){
            w.triggerHandler('resize');
        });
    };
});