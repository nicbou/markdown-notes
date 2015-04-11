angular.module('uploads.service', ['ngResource'])
    .factory('Uploader', ['$http', function($http){
        var Uploader = function(data) {
            angular.extend(this, data);
        };

        Uploader.uploadImage = function(file, noteId) {
            //Check file type
            if (!file || !file.type.match(/image.*/)) return;

            //Build the form data (file, note ID and CSRF token)
            var fd = new FormData();
            fd.append("image", file); // Append the file
            fd.append("note", noteId);

            //Send the request
            return $http({
                method: 'POST',
                url: '/upload/image/',
                data: fd,
                headers: {'Content-Type': undefined},
                transformRequest: angular.identity,
            }).then(function(response) {
                return response.headers('Location');
            });
        };

        return Uploader;
    }]);