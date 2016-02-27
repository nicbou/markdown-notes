//Toggles full screen mode in supported browsers
angular.module('notes.ui').directive("notebookMenuItem", function ($timeout, $notebooksService) {
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
        },
    };
});