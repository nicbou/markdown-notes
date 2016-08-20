angular.module('notes').controller('AuthCtrl', ['$scope', 'close', '$authService', function ($scope, close, $authService) {

    $scope.formType = 'login';
    $scope.formData = {};

    $scope.login = function () {
        $scope.errorMsg = undefined;
        $scope.errorFields = undefined;

        $authService.login($scope.formData.username, $scope.formData.password)
            .then(function (apiKey) {
                close(apiKey);
            })
            .catch(function (response) {
                console.log(response);

                if (response.status == 403) {
                    $scope.errorMsg = 'Username or password doesn\'t match!';
                }else{
                    $scope.errorMsg = 'There was unknown error!';
                }
            });
    };

    $scope.signup = function () {
        $scope.errorMsg = undefined;
        $scope.errorFields = undefined;

        if($scope.formData.password != $scope.formData.passwordAgain) {
            $scope.errorMsg = 'Passwords doesn\'t match!';
            $scope.errorFields = ['password', 'passwordAgain'];
            return;
        }

        $authService.signUp($scope.formData.username, $scope.formData.email, $scope.formData.password)
            .then(function (apiKey) {
                close(apiKey);
            })
            .catch(function (response) {
                var error = response.data.error;
                $scope.errorMsg = error.message;
                $scope.errorFields = [error.field];
            });
    };

    // Resetting error message when changing form type
    $scope.$watch('formType', function () {
        $scope.errorMsg = undefined;
        $scope.errorFields = undefined;
    });
}]);