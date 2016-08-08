/**
 * Holds ApiKey and take care of managing Modal window with User management
 */
angular.module('notes.service')
    .factory('$authService', function (ModalService, $timeout, $q) {

        var apiKey = undefined;

        var getLocalApiKey = function () {
            // TODO: "Remember me" check for locally stored ApiKey
            return undefined;
        };

        var $authService = {
            /**
             * Return ApiKey or undefined if no ApiKey is found
             * @returns {*}
             */
            getApiKey: function () {
                if (apiKey === undefined) {
                    return getLocalApiKey();
                }

                return apiKey;
            },

            /**
             * True if UserService has ApiKey and therefore User is logged in
             * @returns {boolean}
             */
            isLoggedIn: function () {
                return this.getApiKey() !== undefined;
            },

            login: function () {
                return $q(function (resolve, reject) {

                    ModalService.showModal({
                        templateUrl: "/static/js/views/modal.html",
                        controller: "AuthCtrl"
                    }).then(function (modal) {
                        modal.close.then(function (newApiKey) {
                            apiKey = newApiKey;
                            resolve(apiKey);
                        });
                    });
                });
            }
        };

        return $authService;
    });