//Toggles full screen mode in supported browsers
angular.module('notes.ui').directive("noteMenuItem", function ($timeout, $document) {
    return {
        restrict: "A",
        templateUrl: '/static/js/views/noteMenuItem.html',
        link: function (scope, element, attrs) {
            element.attr('draggable', true);

            //Pass the note as the dragged item when drag-dropping the element
            var onDragStart = function (e) {
                e.dataTransfer.effectAllowed = "move"; 
                e.dataTransfer.setData("markdownnotes/note", JSON.stringify(scope.note));
            };
            element.bind("dragstart", onDragStart);
        },
    };
});