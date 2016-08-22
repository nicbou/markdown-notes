angular.module('notes').controller('AuthCtrl', ['$scope', 'close', '$authService', function ($scope, close, $authService) {

    $scope.formType = 'login';
    $scope.formData = {};

    $scope.login = function () {
        $scope.msg = undefined;
        $scope.msgType = undefined;
        $scope.errorFields = undefined;

        $authService.login($scope.formData.username, $scope.formData.password, $scope.formData.rememberMe)
            .then(function (apiKey) {
                close(apiKey);
            })
            .catch(function (response) {
                console.log(response);

                $scope.msgType = 'error';
                if (response.status == 403) {
                    $scope.msg = 'Username or password doesn\'t match!';
                }else{
                    $scope.errorMsg = 'There was unknown error!';
                }
            });
    };

    $scope.signup = function () {
        $scope.msg = undefined;
        $scope.msgType = undefined;
        $scope.errorFields = undefined;

        if($scope.formData.password != $scope.formData.passwordAgain) {
            $scope.errorMsg = 'Passwords doesn\'t match!';
            $scope.msgType = 'error';
            $scope.errorFields = ['password', 'passwordAgain'];
            return;
        }

        $authService.signUp($scope.formData.username, $scope.formData.email, $scope.formData.password)
            .then(function (apiKey) {
                close(apiKey);
            })
            .catch(function (response) {
                var error = response.data.error;
                $scope.msgType = 'error';
                $scope.errorMsg = error.message;
                $scope.errorFields = [error.field];
            });
    };

    $scope.passwordRecovery = function () {
        $scope.msg = undefined;
        $scope.msgType = undefined;
        $scope.errorFields = undefined;

        $authService.passwordRecovery($scope.formData.email)
            .then(function () {
                $scope.msg = 'Email was send to your email address with recovery link.';
                $scope.msgType = 'success';
            })
            .catch(function () {
                $scope.msg = 'There was unknown error!';
                $scope.msgType = 'error';
            });
    };

    // Resetting error message when changing form type
    $scope.$watch('formType', function () {
        $scope.msg = undefined;
        $scope.msgType = undefined;
        $scope.errorFields = undefined;
    });
}]);