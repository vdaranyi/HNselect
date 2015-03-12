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
	// var newSelect = "<a href='XXXX' style='background-color:white'>new Select</a><span> | </span>"
	// $(newSelect).insertBefore('a[href="newest"]')
}

// Receive message from extension
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    parsePageForFollowing();
    if (request.greeting == "hello") {
      sendResponse({farewell: "goodbye"});
      manipulateNavbar();
    }
  });

// ---------------
// Look for user names in page

var following = ['kazinator','comex','robin_reala','revscat','jakke','aestetix', 'ymmt2005', 'epetre', 'Graham24', 'datascientist', 'danso', 'gsans', 'adventured', 'epetre'];

// REFACTOR INTO 2 SEVERAL FUNCTIONS: SEARCH & MANIPULATION
function parsePageForFollowing() {  
  var commentsArr = [];
  var articleIndex = 1;
  $('tbody').eq(2).children('tr').each(function(index){
    if ((index-1) % 3 === 0 && index <= 88) { // 2 FOR TESTING. Reset to 88.
      var $postUserElement = $(this).find('a[href^="user?id"]:first');
      if($postUserElement.length) {
        var postUsername = $postUserElement.text();
        if (following.indexOf(postUsername) > -1) {
          $(this).prev().find('a[href^="http"]').css({color: "#ff6600", "font-weight": "bold"});
          $($postUserElement).css({color: "#ff6600", "font-weight": "bold"});
        }
      }
      var $commentsElement = $postUserElement.nextAll().eq(1);
      if ($commentsElement.length) {
        var commentsHref = $commentsElement[0].href
        commentsArr.push({articleIndex: articleIndex, href: commentsHref, author: postUsername, element: $commentsElement});
      }
    }
    articleIndex++
  });
  parseComments(commentsArr);
}

function addHighlightsToPage() {
  // TO MOVE CODE TO HERE
}


function parseComments(commentsArr) {
  // var parser = new DOMParser(),
  var commentsCount = commentsArr.length,
      cIndex = 0,
      commentsFollowers = {};
  getComments();
  function getComments() {
      var articleIndex = commentsArr[cIndex].articleIndex,
          commentsHref = commentsArr[cIndex].href,
          author = commentsArr[cIndex].author,
          $commentsOriginElement = commentsArr[cIndex].element;
      setTimeout(function(){
        $.get(commentsHref, function(commentsXmlString) {
          // var commentsHtml = parser.parseFromString(commentsXmlString, "text/xml");
          // var commentsHtml = $.parseHTML(commentsXmlString);
          var commentsUser = parseCommentsForFollowing(author, commentsXmlString);
          if (commentsUser.length) {
            // var usersCommentsToAppend = ""
            // Prepare DOM element of users in comments
            for (var i = 0; i < commentsUser.length; i++) {
              var userElement = "<a href='https://news.ycombinator.com/user?id='" + commentsUser[i] + "> " + commentsUser[i] + " </a>";
              console.log(userElement);
              var $userElement = $(userElement).css({color: "#ffffff", "font-weight": "bold", "background-color": "#ff6600"})
              var $toInsert = $("<span>&nbsp</span>").css("background-color", "#f7f7f1").append($userElement);
              $($commentsOriginElement).append($toInsert);
            } 
            // Apend commenters to DOM
          }
          cIndex++;
          if (cIndex < commentsCount) 
            getComments();
        });
      }, 0);
  }
}

// Join with parsePageForFollowing, creating general function
function parseCommentsForFollowing(author, commentsXmlString) {
  var commentsUser = [];
  following.forEach(function(username){
    // console.log(username, commentsXmlString.substring(0,20));
    // console.log(commentsXmlString);
    if (commentsXmlString.indexOf("user?id=" + username) > -1 && username != author) {
      commentsUser.push(username);
    }
  });
  return commentsUser;
}

// function addCommentsUsersToDOM(commentsFollowers) {
//   console.log(commentsFollowers);
// }















