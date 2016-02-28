//Toggles full screen mode in supported browsers
angular.module('notes.ui').directive("newNotebookMenuItem", function ($timeout) {
    return {
        restrict: "A",
        template:
            '<li ng-class="{\'creating-notebook\': creatingNotebook}">' +
            '   <a ng-click="newNotebook()" ng-hide="creatingNotebook">' +
            '       <i class="icon ion-ios-browsers-outline"></i>Create a notebook' +
            '   </a>' +
            '   <span class="editable" ng-show="creatingNotebook">' +
            '       <i class="icon ion-ios-browsers-outline"></i>' +
            '       <input type="text" ng-model="newNotebookTitle" placeholder="Give your notebook a name">' +
            '   </span>' +
            '   <div class="actions" ng-show="creatingNotebook">' +
            '       <a ng-click="saveNotebook()" class="icon ion-ios-checkmark-outline"></a>' +
            '       <a ng-click="cancelNewNotebook()" class="icon ion-ios-close-outline"></a>' +
            '   </div>' +
            '</li>',
        replace: true,
        link: function (scope, element, attrs) {
            var textbox = element[0].querySelector('.editable input');

            scope.newNotebookTitle = '';

            scope.newNotebook = function(){
                scope.newNotebookTitle = '';
                scope.creatingNotebook = true;
                $timeout(function() {
                    textbox.focus();
                });
            };

            scope.saveNotebook = function(){
                scope.createNotebook(scope.newNotebookTitle);
                scope.creatingNotebook = false;
            };

            scope.cancelNewNotebook = function(){
                scope.creatingNotebook = false;
            };

            angular.element(textbox).bind('keydown keypress', function(e){
                if(e.which == 13){ //enter
                    scope.saveNotebook();
                }
                else if(e.which == 27){ //escape
                    scope.cancelNewNotebook();
                    scope.$apply();
                }
            });
        },
    };
});