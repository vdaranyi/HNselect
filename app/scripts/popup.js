'use strict';

// Executed when icon gets clicked

// HOW TO USE A LIGHTER FRAMEWORD, EG SWIG INSTEAD OF ANGULAR IN THE BROWSER?
var app = angular.module('app', [])

	.controller('Main', function($scope) {
		$scope.user = user;
	});


// RESPONSE DOES NOT GET CONSOLE.LOGGED OUT
chrome.tabs.getSelected(null, function(tab) {
  // Send a request to the content script.
  chrome.tabs.sendRequest(tab.id, {action: "getUser"}, function(response) {
    console.log('received:',response.user);
    $scope.user = response.user;
    $scope.$digest;
  });
});


// Send message to contentscript
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
});