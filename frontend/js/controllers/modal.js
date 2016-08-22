angular.module('notes').controller('ModalCtrl', function ($scope, close, $authService, formType) {

    $scope.formType = (formType != undefined ? formType : 'login');
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
                $scope.msgType = 'error';
                if (response.status == 403) {
                    $scope.msg = 'Username or password doesn\'t match!';
                }else{
                    $scope.msg = 'There was unknown error!';
                }
            });
    };

    $scope.signup = function () {
        $scope.msg = undefined;
        $scope.msgType = undefined;
        $scope.errorFields = undefined;

        if($scope.formData.password != $scope.formData.passwordAgain) {
            $scope.msg = 'Passwords doesn\'t match!';
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
                $scope.msg = error.message;
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

    $scope.accountSettings = function () {
        $scope.msg = undefined;
        $scope.msgType = undefined;
        $scope.errorFields = undefined;

        if(!$authService.isLoggedIn()){
            $scope.msg = 'You are not logged in!';
            $scope.msgType = 'error';
            return;
        }

        var email = $scope.formData.email;
        var password = $scope.formData.password;
        var passwordAgain = $scope.formData.passwordAgain;
        var oldPassword = $scope.formData.oldPassword;
        var payload = {};

        if(password || passwordAgain || oldPassword) {
            if(!password || !passwordAgain || !oldPassword) {
                $scope.msg = 'If you want to change password, you have to fill in all password fields!';
                $scope.msgType = 'error';
                $scope.errorFields = ['password', 'passwordAgain', 'oldPassword'];
                return;
            }

            if (password != passwordAgain) {
                $scope.msg = 'Password and repeated password has to match!';
                $scope.msgType = 'error';
                $scope.errorFields = ['password', 'passwordAgain'];
                return;
            }

            payload['password'] = password;
            payload['old_password'] = oldPassword;
        }

        if(email) {
            payload['email'] = email;
        }

        $authService.updateAccountSettings(payload)
            .then(function () {
                $scope.msg = 'Settings were successfully changed!';
                $scope.msgType = 'success';
            })
            .catch(function (response) {
                var error = response.data.error;
                $scope.msgType = 'error';
                $scope.msg = error.message;
                $scope.errorFields = [error.field];
            });

    };

    $scope.close = function () {
        close();
    };

    // Resetting error message when changing form type
    $scope.$watch('formType', function () {
        $scope.msg = undefined;
        $scope.msgType = undefined;
        $scope.errorFields = undefined;
    });
});