'use strict';

require('./sidebar.jsx');
require('./pageHighlighting.js');


// FILE TO BE CLEANED UP

// Constants
var hnOrange = '#ff6600',
    commentsBgColor = hnOrange,
    commentsTitleColor = hnOrange,
    authorColor = hnOrange,
    commentersTextColor = "#ffffff",
    commentersBgColor = hnOrange,
    bgGrey = "#f7f7f1",
    following = [],
    getCommentersRoute = 'http://www.hnselect.com/getCommenters';
//getCommentersRoute = 'https://hn-select.herokuapp.com/getCommenters';


// Selecting highlighting method depending on view
// var tabUrl = window.location.href;
// var tabQuery = window.location.search;
// if (tabQuery.indexOf('?id=') > -1 || tabUrl.indexOf('newcomments') > -1) {
//     console.log(' > Highlighting comments');
//     // highlightComments();
// } else {
//     console.log(' > Highlighting stories');
//     // highlightNews();
// }

var user, following;

//remove duplication of getting user
chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    if (request.action == "getUser") {
        var user = $('a[href^="user?id="]').attr('href').replace('user?id=', '');
        sendResponse({user: user});
        console.log('sending', user);
    } else
        sendResponse({}); // Send nothing..
});

/* Inform the backgrund page that
 * this tab should have a page-action */
chrome.runtime.sendMessage({
    from: 'content',
    subject: 'showPageAction'
});

/* Listen for message from the popup */
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.request) {
            following = request.request
        }
        else {
            console.log('error')
        }
    });




