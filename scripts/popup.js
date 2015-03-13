'use strict';

// Executed when icon gets clicked

// HOW TO USE A LIGHTER FRAMEWORD, EG SWIG INSTEAD OF ANGULAR IN THE BROWSER?
var app = angular.module('app', [])

  .controller('Main', function($scope, UserFactory) {
    chrome.tabs.getSelected(null, function(tab) {
    // Send a request to the content script.
      chrome.tabs.sendRequest(tab.id, {action: "getUser"}, function(response) {

        console.log('received:',response.user);

        // set the user from the response on the scope
        $scope.user = response.user;
        // $scope.$digest();

        UserFactory.getFollowingOrCreateUser($scope.user).then(function(data) {
          $scope.following = data;
          // $scope.$digest();
        });

      });

      $scope.addOrRemoveToFollowing = function(userToFollow) {
        UserFactory.updateFollowing($scope.user, userToFollow).then(function(data) {
          console.log('this is data: ', data);
          $scope.following = data;
          $scope.$digest();
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

// Send message to contentscript
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
});
