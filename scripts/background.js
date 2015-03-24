'use strict';

// Executed when extension is being loaded
// Yeoman provided code
chrome.runtime.onInstalled.addListener(function (details) {
  console.log('previousVersion', details.previousVersion);
});

chrome.tabs.onUpdated.addListener(function (tabId) {
  chrome.pageAction.show(tabId);
});

console.log('\'Allo \'Allo! Event Page for Page Action');


// HN-Select code
// chrome.tabs.getSelected(null, function(tab) {

//   // Now inject a script onto the page
//   // chrome.tabs.executeScript(tab.id, {
//   //      code: "chrome.extension.sendRequest({content: document.body.innerHTML}, function(response) { console.log('success'); });"
//   //    }, function() { console.log('done'); });

// });

// Fetch data from HNSelect server
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == "xhttp") {
        var xhttp = new XMLHttpRequest();
        var method = request.method ? request.method.toUpperCase() : 'GET';

        xhttp.onload = function() {
            callback(xhttp.responseText);
        };
        xhttp.onerror = function() {
            // Do whatever you want on error. Don't forget to invoke the
            // callback to clean up the communication port.
            callback();
        };
        xhttp.open(method, request.url, true);
        if (method == 'POST') {
            xhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        xhttp.send(request.data);
        return true; // prevents the callback from being called too early on return
    }
});


// ---------------




chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.type == "getFollowing"){
      var username = request.user;
      getUrls(username, request, sender, sendResponse)
    }
});

function getUrls(username, request, sender, sendResponse){
  var resp = sendResponse;
  $.ajax({
    url: "http://localhost:3000/user/:username",
    method: 'GET',
    success: function(following){
      resp(following);
    }
  });

}