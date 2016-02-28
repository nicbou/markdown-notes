angular.module('notes.ui').directive("imagedrop", function ($parse, $document) {
    return {
        restrict: "A",
        link: function (scope, element, attrs) {
            var onImageDrop = $parse(attrs.onImageDrop);

            var isImageDrag = function(e){
                return e.dataTransfer.types[0] === 'Files';
            };
 
            //When an item is dragged over the document
            var onDragOver = function (e) {
                e.preventDefault();

                if(isImageDrag(e)){
                    angular.element($document[0].body).addClass("drag-over");
                }
            };
 
            //When the user leaves the window, cancels the drag or drops the item
            var onDragEnd = function (e) {
                e.preventDefault();
                angular.element($document[0].body).removeClass("drag-over");
            };
 
            //When a file is dropped
            var loadFile = function (file) {
                scope.uploadedFile = file;
                scope.$apply(onImageDrop(scope));
            };
 
            //Dragging begins on the document
            $document.bind("dragover", onDragOver);
            
            //Dragging ends on the overlay, which takes the whole window
            element.bind("dragleave", onDragEnd)
                   .bind("drop", function (e) {
                       onDragEnd(e);
                       loadFile(e.dataTransfer.files[0]);
                   });
        }
    };
});