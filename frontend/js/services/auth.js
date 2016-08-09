/**
 * Holds ApiKey and take care of managing Modal window with User management
 */
var servicesModule = angular.module('notes.service');

servicesModule.factory('$authService', function (ModalService, $timeout, $q, $http, $base64, $window) {
    var LOGIN_ROUTE = '/api/v1/user/',
        SIGNUP_ROUTE = '/api/v1/createuser/';

    var apiKey = undefined;

    var getLocalApiKey = function () {
        // TODO: "Remember me" feature
        apiKey = $window.sessionStorage.apiKey || $window.localStorage.apiKey;
        return apiKey;
    };

    var $authService = {
        login: function (username, password) {
            var auth = $base64.encode(username + ":" + password),
                headers = {"Authorization": "Basic " + auth};

            return $http.get(LOGIN_ROUTE, {headers: headers})
                .then(function (response) {
                    apiKey = username + ":" + response.data.api_key;
                    $window.sessionStorage.apiKey = apiKey;
                    return apiKey;
                });
        },

        /**
         * Return ApiKey or undefined if no ApiKey is found
         *
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
         *
         * @returns {boolean}
         */
        isLoggedIn: function () {
            return this.getApiKey() !== undefined;
        },

        /**
         * Create modal window with login/signup form and return promise
         * which will result with ApiKey of the user.
         *
         * @returns {Promise}
         */
        modal: function () {
            return ModalService.showModal({
                templateUrl: "/static/js/views/modal.html",
                controller: "AuthCtrl"
            }).then(function (modal) {
                return modal.close;
            });
        }
    };

    return $authService;
});

servicesModule.factory('httpRequestInterceptor', function ($injector) {
    return {
        request: function (config) {
            var $authService = $injector.get('$authService');

            if ($authService.isLoggedIn()) {
                config.headers['Authorization'] = 'ApiKey ' + $authService.getApiKey();
            }
            return config;
        }
    };
});

servicesModule.config(function ($httpProvider) {
    $httpProvider.interceptors.push('httpRequestInterceptor');
});