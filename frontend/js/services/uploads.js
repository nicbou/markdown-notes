angular.module('notes.service').factory('Uploader', ['$http', function($http){
    var Uploader = function(data) {
        angular.extend(this, data);
    };

    Uploader.uploadImage = function(file, note) {
        //Check file type
        if (!file || !file.type.match(/image.*/)) return;

        //Build the form data (file, note ID and CSRF token)
        var fd = new FormData();
        fd.append("image", file); // Append the file
        fd.append("note", note.id);

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