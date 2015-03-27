(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
    getCommentersRoute = 'https://localhost:3000/getCommenters';
// getCommentersRoute = 'https://hn-select.herokuapp.com/getCommenters';


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






},{"./pageHighlighting.js":2,"./sidebar.jsx":3}],2:[function(require,module,exports){
console.log('pageHighlighting');
var server = 'http://localhost:3000';
var hnOrange = '#ff6600',
    commentsBgColor = hnOrange,
    commentsTitleColor = hnOrange,
    authorColor = hnOrange,
    commentersTextColor = "#ffffff",
    commentersBgColor = hnOrange,
    bgGrey = "#f7f7f1";


parseHnPage();

function parseHnPage() {
    var storiesOnPage = {},
        storyIdsOnPage = [],
        highlightData;
    // REFACTOR to get the user
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
            storiesOnPage[storyId] = {
              storyId: storyId,
              $storyTitle: $storyTitle,
              $author: $author,
              author: author
            };
            storyIdsOnPage.push(Number(storyId));
        }
    });
    // var storyIdsReqObject = {storyIds: storyIdsOnPage};
    fetchHighlight(user, storiesOnPage, storyIdsOnPage);
} 

function fetchHighlight(username, storiesOnPage, storyIdsOnPage) {
   // Get highlight data from server
    console.log(storyIdsOnPage);
    chrome.runtime.sendMessage({
            method: 'POST',
            action: 'ajax',
            url: server + '/user/' + username + '/highlight',
            data: storyIdsOnPage
    }, function (response) {
            console.log(typeof response, response);
            if (response && response !== 'Not Found') {
                highlightData = JSON.parse(response);   
                highlightStories(storiesOnPage, highlightData);
            } else {
                console.log('Did not retrieve highlight data');
            }
    })
}

function highlightStories(stories, highlightData) {
    console.log(highlightData);
    // s stands for storyId
    for (var s in highlightData) {
        if (highlightData.hasOwnProperty(s)) {
            console.log(s);
            if (highlightData[s].author.length) {
                stories[s].$storyTitle.css({color: commentsTitleColor, 'font-weight': 'bold'});
                stories[s].$author.css({color: authorColor, 'font-weight': 'bold'});
            }
            if (highlightData[s].commenters.length) {
                var commenters = highlightData[s].commenters;
                for (var c = 0; c < commenters.length; c++) {
                    var commentersElement = "<a href='https://news.ycombinator.com/user?id=" + commenters[c] + "'> " + commenters[c] + " </a>";
                    console.log(commentersElement);
                    var $commentersElement = $(commentersElement).css({
                        color: commentersTextColor,
                        'font-weight': 'bold',
                        'background-color': commentersBgColor
                    })
                    var $toInsert = $("<span>&nbsp</span>").css("background-color", bgGrey).append($commentersElement);
                    console.log(stories);
                    stories[s].$author.nextAll().eq(1).after($toInsert);
                }
            }   
        }
    }
}


// NOT YET FUNCTIONAL
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







},{}],3:[function(require,module,exports){
// Constants

var server = 'http://localhost:3000';
var username = 'glennonymous';

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
            return ( 
                React.createElement("div", {className: "sidebarbox"}, 
                    React.createElement("div", {className: "sidebarbutton"}, 
                        React.createElement(CloseButton, null)
                    ), 
                    React.createElement("div", {id: "sidebarcontentarea", className: "container-fluid"}, 
                        React.createElement("div", {id: "nav-area"}, 
                            React.createElement("div", {className: "row"}, 
                                React.createElement(OwnerInfo, null)
                            ), 
                            React.createElement("div", {id: "horiz-rule"}), 
                            React.createElement(NavBar, null)
                        ), 
                        React.createElement("div", {id: "content-holder"}, 
                        React.createElement(ContentList, {data: this.props.data})
                            )
                    )
                )
            );
        }

});

var drawerIsClosed = false;

// Close button component
// --> ISSUE: All these jQuery queries should be stored as variables, so we only need to access them once.
var CloseButton = React.createClass({displayName: "CloseButton",

    // Functionality: Button causes sidebar to slide closed if it is open, open if it is closed.
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

    // Renders the actual button
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
        return (
            React.createElement("div", null, 
                React.createElement("div", {id: "owner-box", className: "col-md-6 col-sm-6 col-xs-6"}, 
                    React.createElement("div", {id: "owner-name"}, 
                        React.createElement("h2", {className: "nav-title"}, "glennonymous")
                    )
                ), 
                React.createElement("div", {id: "owner-stats", className: "col-md-6 col-sm-6 col-xs-6"}, 
                    React.createElement("div", {className: "col-md-4 col-sm-4 col-xs-4 owner-stat"}, 
                        React.createElement("div", {className: "owner-stattitle"}, "karma"), 
                        React.createElement("div", {className: "owner-statscore"}, "1")
                    ), 
                    React.createElement("div", {className: "col-md-4 col-sm-4 col-xs-4 owner-stat"}, 
                        React.createElement("div", {className: "owner-stattitle"}, "following"), 
                        React.createElement("div", {className: "owner-statscore"}, "15")
                    ), 
                    React.createElement("div", {className: "col-md-4 col-sm-4 col-xs-4 owner-stat"}, 
                        React.createElement("div", {className: "owner-stattitle"}, "followers"), 
                        React.createElement("div", {className: "owner-statscore"}, "1")
                    )
                )
            )
        )
    }
});

// Suggestions (suggestionarea)

var SuggestionArea = React.createClass({displayName: "SuggestionArea",
    render: function () {
        return React.createElement("div", {id: "suggest-box", className: "col-md-6 col-sm-6 col-xs-6"}, 
            React.createElement("div", {id: "suggest-title"}
            /*<h2 className="nav-title">Who to follow</h2>*/
            ), 
            React.createElement("div", {id: "suggest-tags"}
            /*<ul>
             <li>joefred</li>
             &nbsp;
             <li>fredbob</li>
             &nbsp;
             <li>aprilmay</li>
             &nbsp;
             <li>june1972</li>
             &nbsp;
             <li>aLincoln</li>
             &nbsp;
             <li>aynRandy</li>
             &nbsp;
             </ul>*/
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
        return React.createElement("div", {id: "search-box"}
        /*<div className="input-group">
         <input type="text" className="form-control" placeholder="Search" />
         <span className="input-group-btn">
         <button className="btn btn-default" type="button">Submit</button>
         </span>
         </div>*/
        );
    }
});

// Navbar
// - Feed
// - Updates
// - Connections
// - Favorites
// - Settings

// Make tabs fixed-width divs with inactive tab background.
// Make Newsfeed tab active when sidebar loads.

var NavBar = React.createClass({displayName: "NavBar",
    render: function () {
        return React.createElement("div", {id: "navbar-bar"}, 
            React.createElement("div", {id: "navbar-buttons", className: "row"}, 
                React.createElement("ul", null, 
                    React.createElement("li", null, 
                        React.createElement("div", {className: "col-md-3 col-sm-3 col-xs-3 navbar-button", id: "newsfeed", active: "true"}, "newsfeed")
                    ), 
                    React.createElement("li", null, 
                        React.createElement("div", {className: "col-md-3 col-sm-3 col-xs-3 navbar-button", id: "notifications"}, "notifications")
                    ), 
                    React.createElement("li", null, 
                        React.createElement("div", {className: "col-md-3 col-sm-3 col-xs-3 navbar-button", id: "connections"}, "connections")
                    ), 
                    React.createElement("li", null, 
                        React.createElement("div", {className: "col-md-1 col-sm-1 col-xs-1 navbar-button"})
                    ), 
                    React.createElement("li", null, 
                        React.createElement("div", {className: "col-md-1 col-sm-1 col-xs-1 navbar-button navbar-button-right", id: "favorites"}, 
                            React.createElement("img", {src: "https://s3.amazonaws.com/gdcreative-general/star_64_gray.png", width: "13px"})
                        )
                    ), 
                    React.createElement("li", null, 
                        React.createElement("div", {className: "col-md-1 col-sm-1 col-xs-1 navbar-button navbar-button-right", id: "settings"}, 
                            React.createElement("img", {src: "https://s3.amazonaws.com/gdcreative-general/gear_64_gray.png", width: "13px"})
                        )
                    )
                )
            )
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

var timeToNow = function (timestamp) {
    var now = Date()
    //console.log(now)
    var since = now - timestamp
    if (since < 3600000) return Math.floor(since / 60000) + " minutes ago";
    else return Math.floor(since / 360000) + "hours ago";
}

var newsfeed,
    initialLoadHasTakenPlace = false,
    maxItemFb = new Firebase('https://hacker-news.firebaseio.com/v0/maxitem'),
    fakeNewsFeed = {
        by: "whybroke",
        id: 9272626,
        kids: [
            9272895
        ],
        parent: 9272193,
        text: "&gt;Edit: On why skepticism is important, its because propaganda is everywhere. kooks.",
            time: 1427399926,
    type: "comment"
}

var followingList = ["peterhunt","espadrine", "mdewinter", "robin_reala", "atmosx", "awch"];

function iterateOverItems(start, end, following) {
    console.log("iterating:", start, end, following)
    var newsArray = [];
    for (var i=end; i>start; i--) {
        for (var j in following) {
            //console.log("doing something")
            newsArray.push(fetchItems(i, following[j]));
        }
    }
    //if (newsArray.length !== 0 && followingList.indexOf(newsArray[0].by) !== -1) followingList.push(newsArray[0].by);
    //console.log("newsArray:" newsArray);
    return newsArray;
}

//var counter = 0;

function fetchItems(itemId) {
    var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/' + itemId + '.json?print=pretty';
    var filteredArticles = [];
    //console.log(commenters);

    $.get(itemUrl)
        .then(function (response) {
            return response;

            console.log("This is the response: ", response)
        //    if (typeof response === 'object') {
        //        //var commenter = response.by;
        //        //
        //        //if (commenters.indexOf(commenter) !== -1) {
        //        //}
        //    }
        })

}

var ContentList = React.createClass({displayName: "ContentList",

    getInitialState: function(){
        return {
            data: null
        }
    },

    initialArticleLoad: function() {
        var self = this;

        if (!initialLoadHasTakenPlace) {
            chrome.runtime.sendMessage({
                method: 'GET',
                action: 'ajax',
                url: server + '/user/' + username + '/newsfeed',
                data: ''
            }, function (response) {
                if (response && response !== 'Not Found') {
                    //console.log(response);
                    newsfeed = response;
                    //console.log(newsfeed)
                    self.setState({data: newsfeed});
                } else {
                    self.setState({data: null});
                }
            })
            initialLoadHasTakenPlace = true;
        }
    },

    articleUpdate: function() {
        var self = this;
        maxItemFb.on('value', function(snapshot) {
            setTimeout(function() {


                var newNewsfeed = [];
                var snap = snapshot.val();
                var maxItem = snap;
                var lastItemFetched = snap - 5;
                var currentItemNo = lastItemFetched + 1;
                console.log('max item: ', snap);
                //lastItemFetched = maxItem;
                //newNewsfeed = iterateOverItems(currentItemNo,maxItem,followingList);
                var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/' + snap + '.json?print=pretty';
                $.get(itemUrl)
                    .then(function (response) {
                        console.log("This is the response: ", response)
                        newNewsfeed.push(response);
                        newsfeed = newNewsfeed.concat(newsfeed)
                        self.setState({data: newsfeed});
                        //    if (typeof response === 'object') {
                        //        //var commenter = response.by;
                        //        //
                        //        //if (commenters.indexOf(commenter) !== -1) {
                        //        //}
                        //    }
                    })
                //console.log(maxItem);

                //console.log("news", newsfeed);
            }, 10000);
        })
    },

    componentDidMount: function() {
        this.initialArticleLoad();
        this.articleUpdate();
    },

    render: function () {
        if (this.state.data) {
            return (
                React.createElement("div", null, 
                    this.state.data.map(function (item) {
                        return React.createElement(ContentItem, {data: item})
                    })
                )
            ) 
        } else {
            return React.createElement("h6", {className: "content-maintitle"}, "Could not retrieve data from server");
        } 
    }
});

var ContentItem = React.createClass({displayName: "ContentItem",
    // Determine whether data object is a comment or a news article and render accordingly
    render: function(){
        if (this.props.data.type === "story") {
            return (
                React.createElement("div", {className: "content-box"}, 
                    React.createElement("div", {className: "content-title"}, 
                        React.createElement("h3", {className: "content-maintitle"}, this.props.data.title), 
                        React.createElement("h4", {className: "content-secondarytitle"}, this.props.data.url, ")")
                    ), 
                    React.createElement("div", {className: "content-content"}, 
                        React.createElement("p", {className: "content-text"}, this.props.data.text)
                    ), 
                    React.createElement("div", {className: "content-footer"}, 
                        React.createElement("p", {className: "content-footertext"}, "by ", this.props.data.by, " ", timeToNow(this.props.data.timestamp), " | ", this.props.data.no_of_comments, " comments")
                    )
                )
            );
        } else {
            return (
                React.createElement("div", {className: "content-box"}, 
                    React.createElement("div", {className: "content-title"}, 
                        React.createElement("h4", {className: "content-secondarytitle"}, "Comment on "), 
                        React.createElement("h3", {className: "content-maintitle"}, this.props.data.commenton), 
                        React.createElement("h4", {className: "content-secondarytitle"}, " by ", this.props.data.by)
                    ), 
                    React.createElement("div", {className: "content-content"}, 
                        React.createElement("p", {className: "content-text", dangerouslySetInnerHTML: {__html: this.props.data.text}})
                    ), 
                    React.createElement("div", {className: "content-footer"}, 
                        React.createElement("p", {className: "content-footertext"}, "original post by ", this.props.data.parent_poster, " ", timeToNow(this.props.data.timestamp), " | ", this.props.data.no_of_comments, " comments")
                    )
                )
            );
        }
    }
});





},{}]},{},[1]);
