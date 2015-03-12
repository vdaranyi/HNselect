'use strict';

// Executed when matching page gets loaded





// Respond to request from extension
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
 if (request.action == "getUser") {
   var user = $('a[href^="user?id="]').attr('href').replace('user?id=','');
   sendResponse({user: user});
   console.log('sending', user);
 } else
   sendResponse({}); // Send nothing..
});

// Add newSelect tab
function manipulateNavbar() {
	var newSelect = "<a href='XXXX' style='background-color:white'>new Select</a><span> | </span>"
	$(newSelect).insertBefore('a[href="newest"]')
}

// Receive message from extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello") {
      sendResponse({farewell: "goodbye"});
      manipulateNavbar();
    }
  });
