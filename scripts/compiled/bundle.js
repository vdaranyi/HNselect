(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var sidebar = require('./sidebar.jsx')

// NOTE TO VINCENT: Browserify allows us to modularize files the same way we do with
// Node, by writing "require" lines like the one above. From here on out I will be
// following that practice. Eventually this document will probably have no content
// except require lines because everything will be in modules.
// ALSO NOTE: You must run gulp while making changes to front-end files, and make sure
// 'buildJS' runs by making and saving a change. Otherwise you might think your
// changes have been made, but they will not.

// -->ISSUE: After several seconds we get an uncaught typeError on line 93, "Cannot read property 'by' of null".
// After we get this error, highlighting stops.

// Constants
var hnOrange = '#ff6600',
    commentsBgColor = hnOrange,
    commentsTitleColor = hnOrange,
    authorColor = hnOrange,
    commentersTextColor = "#ffffff",
    commentersBgColor = hnOrange,
    bgGrey = "#f7f7f1",
    following = [],
// following = ['quicksilver03', 'apertoire', 'Vigier', 'peterkrieg', 'nkurz', 'gkoberger', 'txu',
// 'technomancy', 'scott_s', 'AustinBGibbons', 'ynniv', 'kifler' ],
    getCommentersRoute = 'https://localhost:3000/getCommenters';
// getCommentersRoute = 'https://hn-select.herokuapp.com/getCommenters';


// Selecting highlighting method depending on view
var tabUrl = window.location.href;
var tabQuery = window.location.search;
if (tabQuery.indexOf('?id=') > -1 || tabUrl.indexOf('newcomments') > -1) {
    console.log(' > Highlighting comments');
    highlightComments();
} else {
    console.log(' > Highlighting stories');
    highlightNews();
}

var user, following;


function highlightNews() {
    var storiesOnPage = [],
        storyIdsOnPage = [];
    // user;
    $('a[href^="user?id"]').each(function (index) {
        if (index === 0) {
            user = $(this).text();
        } else {
            var story = {};
            // console.log('index', index);
            var $author = $(this);
            var author = $author.text();
            var $storyTitle = $author.parents('tr:first').prev('tr').find('a[href^="http"]');
            var storyId = $author.next('a[href^="item?id"]').attr('href').replace('item?id=', '');

            // Put all stories on page into array for subsequent comment following analysis
            // storiesOnPage.push({
            //   storyId: storyId,
            //   $storyTitle: $storyTitle,
            //   $author: $author,
            //   author: author,
            //   commenters: []
            // });
            // storyIdsOnPage.push(storyId); // ONLY NEEDED FOR SERVER REQUEST
            story = {
                storyId: storyId,
                $storyTitle: $storyTitle,
                $author: $author,
                author: author,
                commenters: []
            };

            // Fetch story and commenters
            // storiesOnPage[storiesOnPage.length-1].commenters = fetchItems(storyId, [])
            var counter = 1,
                totalcount = 1;
            fetchItems(storyId, []);


            function fetchItems(itemId, commenters) {
                var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/' + itemId + '.json?print=pretty';
                // console.log(commenters);


                // console.log(counter);
                $.get(itemUrl)
                    .then(function (response) {
                        counter--;
                        // Iterating over the comments recursively
                        if (typeof response === 'object') {
                            // Add commenter
                            var commenter = response.by;
                            // console.log(commenter);
                            if (commenters.indexOf(commenter) === -1 && following.indexOf(commenter) > -1) {
                                commenters.push(commenter);
                                // NEED TO INCLUDE CHECK WHETHER TO REMOVE STORY AUTHOR
                            }
                            if (response.kids) {
                                // console.log(response.kids);
                                var children = response.kids;
                                counter += children.length;
                                totalcount += children.length;
                                children.forEach(function (childId, index) {
                                    // console.log(childId, index);
                                    // console.log();
                                    fetchItems(childId, commenters);
                                    // return commenters;
                                });

                            }
                        }

                        if (counter === 0) {

                            // Remove author
                            var authorIndex = commenters.indexOf(author)
                            if (authorIndex > -1) {
                                commenters.splice(authorIndex, 1);
                                // console.log('*** AUTHOR REMOVED');
                            }
                            // console.log('DONE', totalcount, counter, commenters);
                            // Adding commenters to story object
                            story.commenters = commenters;
                            // Highlight
                            highlightFollowing(story);
                        }
                    })
                // .then(function(response){
                //   console.log('FINAL',commenters);
                //   highlightFollowing(storiesOnPage);
                // });
            }

        }
    });
    /*
     // console.log(storiesOnPage);
     var requestObject = {
     user: user,
     storyIdsOnPage: storyIdsOnPage
     };
     // $.post(getCommentersRoute, requestObject)
     //   .then(function(response) {
     // TESTING backend functionality
     // vvvvvvvvvvvvvvvvvvvvvvvvvvvvv
     var returnedObject = {};
     for (var s = 0; s < storiesOnPage.length; s++) {
     var storyId = storiesOnPage[s].storyId;
     returnedObject[storyId] = ['jseliger','annbabe','mathouc'];
     }
     var response = {};
     response.data = returnedObject;
     // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
     var commentersFollowing = response.data // needs to be an object with key:value pairs storyId:[following by]
     for (var i = 0; i < storiesOnPage.length; i++) {
     // Check whether commentersFollowing includes storyId, i.e. whether people I am following commented
     if (commentersFollowing[storiesOnPage[i].storyId]) {
     var storyCommenters = commentersFollowing[storiesOnPage[i].storyId]
     // Select commenters I am following

     for (var c = 0; c < storyCommenters.length; c++) {
     if (storyCommenters[c].indexOf(following) > -1) {
     storiesOnPage[i].commenters.push(storyCommenters[c]);
     }
     }
     // Add commenters
     storiesOnPage[i].commenters = storyCommenters;
     }
     }
     // Manipulate DOM with highlights
     highlightFollowing(storiesOnPage);
     // });
     */
    function highlightFollowing(story) {
        // for (var s = 0; s < storiesOnPage.length; s++) {
        //   var story = storiesOnPage[s];
        // Highlight authors
        if (following.indexOf(story.author) > -1) {
            story.$storyTitle.css({color: commentsTitleColor, 'font-weight': 'bold'});
            story.$author.css({color: authorColor, 'font-weight': 'bold'});
        }
        // Add commenters
        if (story.commenters) {
            var commenters = story.commenters;
            for (var c = 0; c < commenters.length; c++) {
                var commentersElement = "<a href='https://news.ycombinator.com/user?id=" + commenters[c] + "'> " + commenters[c] + " </a>";
                var $commentersElement = $(commentersElement).css({
                    color: commentersTextColor,
                    'font-weight': 'bold',
                    'background-color': commentersBgColor
                })
                var $toInsert = $("<span>&nbsp</span>").css("background-color", bgGrey).append($commentersElement);
                story.$author.nextAll().eq(1).after($toInsert);
            }
        }
    }

    // }

}


function highlightComments() {
    $('a[href^="user?id"]').each(function (index) {
        var author = $(this).text();
        if (following.indexOf(author) > -1) {
            $(this).parents('td:first').css({'background-color': commentsBgColor});
            $(this).css({'color': commentersTextColor, 'font-weight': 'bold'});
            $(this).nextAll().css({'color': commentersTextColor});
        }
    });
}

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


// chrome.runtime.sendMessage({type: "getFollowing", user: user}, function(response) {
//   console.log(response);
//   following = response;

// });





},{"./sidebar.jsx":2}],2:[function(require,module,exports){
//==========================================================
// Sidebar container and slider functionality

// Attaches an empty div to the DOM to which we can attach our React code
$(document).ready(function () {
    $("body").append("<div id='sidebar-anchor'></div>");
    React.render(React.createElement(SidebarBox, null), $("#sidebar-anchor").get(0));
});

// Sidebar component
var SidebarBox = React.createClass({

    displayName: 'SidebarBox',

    // Set the initial state to cause the div to slide in.
    // Actual animation functionality is set in styles/main.css.
    // --> ISSUE: We should look for an event to trigger the sidebar, rather than setTimeout -- document.onload perhaps
    componentDidMount: function () {
        setTimeout(function () {
            $(".sidebarbox").css({
                right: 0
            });
            $("#sidebarcontentarea")
        }, 500)

    },

    // HTML content to be rendered

    render: function () {
        return React.createElement("div", {className: "sidebarbox"}, 
            React.createElement("div", {className: "sidebarbutton"}, 
                React.createElement(CloseButton, null)
            ), 
            React.createElement("div", {id: "sidebarcontentarea"}, 
                React.createElement(OwnerInfo, null), 
                React.createElement(SuggestionArea, null), 
                React.createElement(NavBar, null), 
                React.createElement(ContentArea, null)
            )
        );
    }

});

var drawerIsClosed = false;

// Close button component
// --> ISSUE: All these jQuery queries should be stored as variables, so we only need to access them once.
var CloseButton = React.createClass({displayName: "CloseButton",

    // Button causes sidebar to slide closed if it is open, open if it is closed.
    closeBox: function () {
        if (!drawerIsClosed) {
            drawerIsClosed = true;
            setTimeout(function () {
                $(".sidebarbox").css({
                    "right": "-470"
                });
                // Icon changes depending if sidebar is open or closed; shadow goes away if closed
                $("#sidebutton").attr("src", "https://s3.amazonaws.com/gdcreative-general/HNselectlogotab.png");
                $("#sidebarcontentarea").css("box-shadow", "none");
            }, 0);
        }


        else {
            setTimeout(function () {
                drawerIsClosed = false;
                $(".sidebarbox").css({
                    right: 0
                });
                // Icon changes depending if sidebar is open or closed; shadow goes away if closed
                $("#sidebutton").attr("src", "https://s3.amazonaws.com/gdcreative-general/HNselectXtab.png");
                $("#sidebarcontentarea").css("box-shadow", "-2px 0px 3px #C0C0C0");
            }, 0);
        }
    },

    // Content to be rendered
    render: function () {
        return React.createElement("img", {src: "https://s3.amazonaws.com/gdcreative-general/HNselectXtab.png", id: "sidebutton", width: "30px", onClick: this.closeBox});
    }
})

//End basic Sidebar functionality
//==========================================================

//Sidebar content
//components needed:

// Owner (ownerinfo)
// - username
// - karma
// - # of people following you
// - # of people you follow

var OwnerInfo = React.createClass({displayName: "OwnerInfo",
    render: function () {
        return React.createElement("div", {id: "owner-box"}, 
            React.createElement("div", {id: "owner-name"}, 
                React.createElement("h2", null, "glennonymous")
            ), 
            React.createElement("div", {id: "owner-stats"}, 
                React.createElement("div", {className: "owner-stat"}, 
                    React.createElement("div", {className: "owner-stattitle"}, "Karma"), 
                    React.createElement("div", {className: "owner-statscore"}, "1")
                ), 
                React.createElement("div", {className: "owner-stat"}, 
                    React.createElement("div", {className: "owner-stattitle"}, "Following"), 
                    React.createElement("div", {className: "owner-statscore"}, "15")
                ), 
                React.createElement("div", {className: "owner-stat"}, 
                    React.createElement("div", {className: "owner-stattitle"}, "Followers"), 
                    React.createElement("div", {className: "owner-statscore"}, "1")
                )
            )
        );
    }
});

// Suggestions (suggestionarea)

var SuggestionArea = React.createClass({displayName: "SuggestionArea",
    render: function () {
        return React.createElement("div", {id: "suggest-box"}, 
            React.createElement("div", {id: "suggest-title"}, 
                React.createElement("h2", null, "Who to follow")
            ), 
            React.createElement("div", {id: "suggest-tags"}, 
                React.createElement("ul", null, 
                    React.createElement("li", null, "joefred"), 
                    React.createElement("li", null, "fredbob"), 
                    React.createElement("li", null, "aprilmay"), 
                    React.createElement("li", null, "june1972"), 
                    React.createElement("li", null, "aLincoln"), 
                    React.createElement("li", null, "aynRandy")
                )
            ), 
            React.createElement(SearchForm, null)
        );
    }
});

// Search form
// - input
// - submit

var SearchForm = React.createClass({displayName: "SearchForm",
    render: function () {
        return React.createElement("div", {id: "search-box"}, 
            React.createElement("div", {class: "input-group"}, 
                React.createElement("input", {type: "text", class: "form-control", placeholder: "Search for people to follow"}), 
                React.createElement("span", {class: "input-group-btn"}, 
                    React.createElement("button", {class: "btn btn-default", type: "button"}, "Submit")
                )
            )
        );
    }
});

// Navbar
// - Feed
// - Updates
// - Connections
// - Favorites
// - Settings

var NavBar = React.createClass({displayName: "NavBar",
    render: function () {
        return React.createElement("div", {id: "navbar-bar"}, 
            React.createElement("div", {id: "navbar-buttons"}, 
                React.createElement("ul", null, 
                    React.createElement("li", null, React.createElement("span", {id: "navbar-feed"}, "Feed")), 
                    React.createElement("li", null, React.createElement("span", {id: "navbar-updates"}, "Updates")), 
                    React.createElement("li", null, React.createElement("span", {id: "navbar-connections"}, "Connections")), 
                    React.createElement("li", null, React.createElement("span", {class: "glyphicon glyphicon-star", id: "navbar-favorites", "aria-hidden": "true"})), 
                    React.createElement("li", null, React.createElement(Gear, {id: "navbar-settings"}))
                )
            ), 
            React.createElement(SearchForm, null)
        );
    }
});

// Item (contentarea)
// - type
// - title
// - url
// - favorite_button
// - score
// - by
// - text

var ContentArea = React.createClass({displayName: "ContentArea",
    render: function () {
        return React.createElement("div", {id: "content-box"}, 
            React.createElement("div", {id: "content-title"}, React.createElement("span", {id: ""})), 
            React.createElement("div", {id: "content-content"}, React.createElement("span", {id: ""}))
        );
    }
});

// Gear icon

var Gear = React.createClass({displayName: "Gear",
    render: function () {
        return React.createElement("svg", {xmlns: "http://www.w3.org/2000/svg"}, React.createElement("path", {d: "M12.793,10.327c0.048-0.099,0.097-0.196,0.138-0.298c0.012-0.023,0.018-0.049,0.028-0.072 c0.03-0.079,0.06-0.158,0.086-0.238c0.005-0.013,0.01-0.023,0.014-0.038c0.008-0.021,0.016-0.041,0.023-0.063L16,8.889V7.111 l-2.918-0.73c-0.009-0.024-0.019-0.047-0.027-0.071c0-0.003-0.001-0.008-0.003-0.012c-0.028-0.085-0.06-0.17-0.093-0.253 c-0.011-0.025-0.018-0.05-0.028-0.075c-0.044-0.107-0.095-0.208-0.144-0.312c-0.011-0.02-0.02-0.04-0.029-0.06 c-0.008-0.015-0.015-0.03-0.021-0.044l1.55-2.582l-1.258-1.258l-2.583,1.549c-0.011-0.005-0.021-0.01-0.031-0.016 c-0.03-0.014-0.059-0.027-0.086-0.041c-0.1-0.047-0.195-0.096-0.298-0.138c-0.025-0.011-0.053-0.019-0.077-0.028 C9.879,3.012,9.804,2.984,9.727,2.958C9.711,2.952,9.694,2.946,9.678,2.94c-0.021-0.007-0.04-0.015-0.061-0.022L8.889,0H7.111 L6.38,2.919C6.361,2.926,6.343,2.934,6.323,2.94C6.308,2.945,6.292,2.952,6.275,2.957C6.199,2.983,6.124,3.011,6.05,3.04 C6.031,3.047,6.011,3.05,5.992,3.058C5.983,3.061,5.977,3.066,5.968,3.07c-0.102,0.042-0.2,0.09-0.299,0.139 C5.644,3.222,5.617,3.233,5.592,3.246C5.58,3.253,5.566,3.258,5.555,3.264L2.973,1.715L1.715,2.972l1.55,2.581 C3.259,5.564,3.254,5.574,3.249,5.585c-0.015,0.03-0.028,0.06-0.043,0.09C3.159,5.771,3.111,5.867,3.07,5.966 c-0.012,0.029-0.02,0.058-0.031,0.086c-0.028,0.072-0.055,0.146-0.08,0.218c-0.006,0.018-0.014,0.035-0.02,0.053 C2.934,6.343,2.925,6.362,2.918,6.381L0,7.111v1.777l2.918,0.729C2.925,9.639,2.934,9.659,2.941,9.68 C2.945,9.693,2.95,9.707,2.956,9.72C2.981,9.798,3.01,9.875,3.04,9.95c0.007,0.019,0.01,0.039,0.017,0.058 c0.003,0.008,0.01,0.016,0.013,0.025c0.044,0.104,0.094,0.205,0.144,0.306c0.01,0.022,0.02,0.044,0.031,0.063 c0.007,0.014,0.013,0.028,0.02,0.043l-1.549,2.582l1.257,1.258l2.581-1.549c0.012,0.006,0.023,0.01,0.036,0.018 c0.025,0.013,0.053,0.024,0.079,0.037c0.101,0.049,0.2,0.099,0.304,0.141c0.022,0.01,0.046,0.016,0.069,0.026 c0.082,0.033,0.166,0.063,0.252,0.093c0.007,0.002,0.014,0.004,0.021,0.006c0.023,0.009,0.045,0.018,0.068,0.026L7.111,16h1.777 l0.729-2.917c0.021-0.008,0.042-0.016,0.062-0.023c0.014-0.005,0.026-0.009,0.04-0.015c0.082-0.027,0.163-0.057,0.241-0.088 c0.022-0.01,0.045-0.016,0.065-0.025c0.109-0.045,0.216-0.096,0.321-0.147c0.017-0.009,0.033-0.016,0.05-0.025 c0.017-0.007,0.032-0.015,0.048-0.022l2.582,1.55l1.258-1.259l-1.549-2.581c0.006-0.011,0.009-0.021,0.015-0.032 C12.766,10.385,12.779,10.355,12.793,10.327z M11.482,8.696c-0.019,0.092-0.054,0.179-0.08,0.269 c-0.037,0.135-0.069,0.271-0.123,0.398c-0.037,0.09-0.092,0.174-0.137,0.26c-0.062,0.119-0.118,0.244-0.192,0.354 c-0.087,0.131-0.196,0.251-0.303,0.373c-0.083,0.093-0.168,0.181-0.259,0.265c-0.133,0.122-0.271,0.241-0.417,0.341 c-0.089,0.059-0.186,0.1-0.278,0.151c-0.112,0.06-0.22,0.129-0.337,0.177c-0.094,0.038-0.195,0.061-0.293,0.092 c-0.125,0.039-0.248,0.086-0.376,0.11c-0.103,0.021-0.211,0.021-0.316,0.032c-0.25,0.025-0.499,0.025-0.748-0.001 c-0.104-0.011-0.21-0.011-0.311-0.031c-0.131-0.024-0.258-0.073-0.387-0.114c-0.094-0.03-0.192-0.051-0.282-0.088 c-0.112-0.046-0.217-0.112-0.324-0.17c-0.075-0.042-0.153-0.076-0.226-0.122c-0.021-0.015-0.047-0.024-0.068-0.038 c-0.122-0.082-0.232-0.184-0.345-0.281c-0.137-0.117-0.262-0.246-0.379-0.383c-0.087-0.104-0.181-0.203-0.254-0.312 c-0.07-0.105-0.122-0.221-0.181-0.333C4.817,9.549,4.759,9.459,4.718,9.36c-0.042-0.103-0.065-0.213-0.1-0.321 c-0.035-0.116-0.08-0.23-0.104-0.35C4.492,8.572,4.489,8.448,4.479,8.326C4.457,8.099,4.458,7.874,4.48,7.647 C4.492,7.535,4.493,7.42,4.515,7.312C4.541,7.177,4.59,7.048,4.632,6.917c0.005-0.016,0.01-0.032,0.015-0.048 c0.025-0.075,0.04-0.154,0.07-0.225c0.05-0.122,0.121-0.236,0.186-0.352C4.95,6.204,4.989,6.111,5.045,6.027 c0.103-0.153,0.227-0.296,0.356-0.436c0.064-0.07,0.132-0.136,0.203-0.201c0.135-0.125,0.273-0.246,0.423-0.345 C6.12,4.983,6.224,4.938,6.324,4.885c0.104-0.057,0.207-0.122,0.316-0.167c0.112-0.046,0.232-0.073,0.35-0.108 c0.061-0.019,0.121-0.04,0.183-0.054c0.045-0.011,0.089-0.03,0.134-0.039c0.189-0.038,0.386-0.053,0.586-0.059 c0.07-0.002,0.14-0.002,0.211,0c0.2,0.006,0.4,0.021,0.591,0.06c0.102,0.02,0.199,0.059,0.298,0.088 c0.125,0.036,0.25,0.065,0.37,0.115C9.46,4.76,9.55,4.818,9.645,4.868c0.111,0.058,0.227,0.11,0.332,0.18 c0.133,0.089,0.256,0.201,0.379,0.311c0.103,0.091,0.199,0.188,0.289,0.29c0.109,0.122,0.219,0.244,0.308,0.376 c0.071,0.104,0.121,0.221,0.181,0.333c0.049,0.094,0.107,0.184,0.147,0.279c0.053,0.126,0.085,0.262,0.122,0.395 c0.021,0.074,0.05,0.147,0.066,0.222c0.004,0.017,0.01,0.032,0.014,0.049c0.041,0.206,0.061,0.419,0.064,0.636 c0,0.026,0.005,0.053,0.005,0.08C11.55,8.25,11.525,8.477,11.482,8.696z"}));
    }
});





},{}]},{},[1]);
