'use strict';

/**
 * @ngdoc function
 * @name qrlogin.controller:DashboardCtrl
 * @description
 * # MainCtrl
 * Controller of the QR login app
 */
angular.module('clientApp')
  .controller('DashboardCtrl', 
    ['$scope', '$state', '$cookies', '$timeout',
      function ($scope, $state, $cookies, $timeout) {
        
        /** Gets the access token from the cookie storage and display on the page */
        $scope.accessToken = $cookies.get('qrAccessToken');

        $scope.displayAccessToken = true;

        /** Close the notification after 5s */
        $timeout(() =>
        {
          $scope.closeAccessTokenNotification();

        }, 5000);
       
        /** Close the notification alert */
        $scope.closeAccessTokenNotification = () => {
          $scope.displayAccessToken = false;
        }
      }
    ]
);
