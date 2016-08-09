angular.module('notes').controller('AuthCtrl', ['$scope', 'close', '$authService', function ($scope, close, $authService) {

    $scope.formType = 'login';
    $scope.formData = {};

    $scope.login = function () {
        $authService.login($scope.formData.username, $scope.formData.password)
            .then(function (apiKey) {
                close(apiKey);
            })
            .catch(function (response) {
                console.log(response);
            });
    };

    $scope.signup = function () {
        $authService.signUp($scope.formData.username, $scope.formData.email, $scope.formData.password)
            .then(function (apiKey) {
                close(apiKey);
            })
            .catch(function (response) {
                console.log(response);
            });
    }
}]);