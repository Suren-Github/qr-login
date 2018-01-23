'use strict';

/**
 * @ngdoc function
 * @name wseanalyticsApp.controller:LoginCtrl
 * @description
 * # MainCtrl
 * Controller of the wseanalyticsApp
 */
angular.module('clientApp')
  .controller('LoginCtrl', 
    ['$scope', '$state', '$cookies', '$timeout', 'loginFactory',
      function ($scope, $state, $cookies, $timeout, loginFactory) {
        
        // Disable error message by default
        $scope.errMsg = false;
        
        $scope.signinCtrl = {
          userName: '',
          password: ''
        };

        /** Check if cookie already exist
         * If so, check if it's valid and does not expire
         */
        var cookieDetails = $cookies.get('qrAccessToken');
        
        if(!cookieDetails){
          
          $scope.sessionExpired = true;

          /** Close the notification after 5s */
          $timeout(() =>
          { 
            $scope.closeNotification();
          }, 5000);
          
          registerUser();
        }
        else{
          $state.go('dashboard');
        }
        
        // Registers the web page on the DB to get the sessionID(QR code)
        function registerUser() {

          var socket = io.connect('http://localhost:3000', {transports: ['websocket'], upgrade: false});
          
          var userDetails = {
            /** Fetches the browser Appagent details using navigator */
            userAgent: loginFactory.getBrowserDetails()
          }

          /** Register the user on page load */
          socket.emit('registerUser', userDetails);

          /** Socket receive event - gets the session id to generate QR code */
          socket.on('getSessionId', (data) => {

            $scope.socketConnId = data;
            $scope.$apply();

          });

          /** Socket receive event - gets the accessToken and expiryTime and  */
          socket.on('login access', (data) => {

            var cookieDetails = $cookies.put('qrAccessToken', data.accessToken);
            
            /** Forward the user to the dashboard page */
            $state.go("dashboard");            
          });

        };               
       
        /** Close the notification alert */
        $scope.closeNotification = () => {
          $scope.sessionExpired = false;
        }

        $scope.login = function(){

          /** Disable error message by default */
          $scope.errMsg = false;

          if($scope.signinCtrl.userName.toLowerCase() === 'admin' && $scope.signinCtrl.password === 'admin'){
            
            sessionStorage.userName = $scope.signinCtrl.userName;

            /** Forward the user to the dashboard page */
            $state.go("dashboard");

          } else {

            $scope.errMsg = true;

          } 
        };
      }
    ]
);
