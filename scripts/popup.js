'use strict';

// Executed when icon gets clicked

// HOW TO USE A LIGHTER FRAMEWORD, EG SWIG INSTEAD OF ANGULAR IN THE BROWSER?
var app = angular.module('app', [])

  .controller('Main', function($scope, UserFactory) {
    chrome.tabs.getSelected(null, function(tab) {
    // Send a request to the content script.
     chrome.tabs.sendRequest(tab.id, {action: "getUser"}, function(response) {
        console.log('These are the arguments: ', arguments);
        console.log('received:', response.user);
        // set the user from the response on the scope
        $scope.user = response.user;
        // $scope.$digest();

        UserFactory.getFollowingOrCreateUser($scope.user).then(function(data) {
          $scope.following = data;
          chrome.tabs.sendMessage(tab.id, {request: data});
          console.log(data)
          // $scope.$digest();
        });

      });


      $scope.addOrRemoveToFollowing = function(userToFollow) {
          UserFactory.updateFollowing($scope.user, userToFollow).then(function(data) {
            console.log('this is data: ', data);
            $scope.following = data;
            $scope.$digest();
            document.getElementById('hnUsername').value='';
          });
      };
    });
  })



  .factory('UserFactory', function($http) {
    return {

      getFollowingOrCreateUser: function(user) {
        return $http.get('http://localhost:3000/user/' + user).then(function(response) {
          return response.data;
        });
      },

      updateFollowing: function(user, userToFollow) {
        return $http.put('http://localhost:3000/user/' + user, {differentUser: userToFollow}).then(function(response) {
          return response.data;
        });
      }
    };

  });
