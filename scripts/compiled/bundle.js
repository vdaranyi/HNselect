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
//console.log('pageHighlighting');
var server = 'http://hn-select.herokuapp.com';
var hnOrange = '#ff6600',
    hnGrey = '#828282',
    commentsBgColor = hnOrange,
    commentsTitleColor = hnOrange,
    authorColor = hnOrange,
    commentersTextColor = "#ffffff",
    commentersBgColor = hnGrey,
    bgGrey = "#f7f7f1";

// var top100 = [];
// $('a[href^="user?id"]').each(function (index, elem) {
//     top100.push($(this).text());
// });
// console.log(JSON.stringify(top100));


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
   // console.log(storyIdsOnPage);
    chrome.runtime.sendMessage({
            method: 'POST',
            action: 'ajax',
            url: server + '/user/' + username + '/highlight',
            data: storyIdsOnPage
    }, function (response) {
            //console.log(typeof response, response);
            if (response && response !== 'Not Found') {
                highlightData = JSON.parse(response);   
                highlightStories(storiesOnPage, highlightData);
            } else {
                console.log('Did not retrieve highlight data');
            }
    })
}

function highlightStories(stories, highlightData) {
    //console.log(highlightData);
    // s stands for storyId
    for (var s in highlightData) {
        if (highlightData.hasOwnProperty(s)) {
            //console.log(s);
            if (highlightData[s].author.length) {
                stories[s].$storyTitle.css({color: commentsTitleColor, 'font-weight': 'bold'});
                commenterStyling(stories[s].$author, 'story');
            }   
            if (highlightData[s].commenters.length) {
                var commenters = highlightData[s].commenters;
                for (var c = 0; c < commenters.length; c++) {
                    var commentersElement = "<a href='https://news.ycombinator.com/user?id=" + commenters[c] + "'> " + commenters[c] + " </a>";
                    //console.log(commentersElement, 'comment');
                    var $commentersElement = commenterStyling($(commentersElement));
                    stories[s].$author.nextAll().eq(1).after($commentersElement);
                }
            }   
        }
    }

    function commenterStyling($authorDomElem, type) {
        $authorDomElem.css({
            color: commentersTextColor,
            'font-weight': 'bold',
            'background-color': commentersBgColor
        });
        if (type === 'story') {
            $authorDomElem.prepend("<span>&nbsp</span>").append("<span>&nbsp</span>");
        } else {
            var $toInsert = $("<span>&nbsp</span>").css("background-color", bgGrey).append($authorDomElem);
            return $toInsert;
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
var hnUrl = "https://news.ycombinator.com";

// TO DO
// Change server, change following indexOf check, change returning two different feed-items


// Global variables

var newsfeed, lastItemFromDB, lastItemFetched, following, user
    initialLoadHasTakenPlace = false,
    maxItemFb = new Firebase('https://hacker-news.firebaseio.com/v0/maxitem');

//==========================================================
// Sidebar container and slider functionality

// Attaches an empty div to the DOM and renders component
$(document).ready(function () {
    username = $('a[href^="user?id="]').attr('href').replace('user?id=', '');
    $("body").append("<div id='sidebar-anchor'></div>");
    React.render(React.createElement(SidebarBox, null), $("#sidebar-anchor").get(0));
});


// Sidebar component
var SidebarBox = React.createClass({

    displayName: 'SidebarBox',

    // Attaches sidebar to the DOM and causes it to slide in
    componentDidMount: function () {
        setTimeout(function () {
            $(".sidebarbox").css({
                right: 0
            });
            $("#sidebarcontentarea")
        }, 1000)

    },

    getInitialState: function () {
        return {target: "Newsfeed"}
    },

    changeState: function (targetName) {
        this.setState({target: targetName})
        console.log("Target received by Parent: ", targetName);
    },

    render: function () {
        var self = this;
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
                        React.createElement(NavBar, {changeState: this.changeState, initialState: this.getInitialState})
                    ), 
                    React.createElement("div", {id: "feed-holder", className: this.state.target}, 
                        React.createElement(ContentHolder, null)
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
                $("#sidebutton").attr("src", "https://s3.amazonaws.com/gdcreative-general/HNselectlogotab_orange.png")
                $("#sidebutton").css("-webkit-filter", "none");
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
                $("#sidebutton").attr("src", "https://s3.amazonaws.com/gdcreative-general/HNselectXtab_orange.png");
                $("#sidebutton").css("-webkit-filter", "drop-shadow(-2px 0px 2px rgba(70,40,10,0.6))");
                $("#sidebarcontentarea").css("box-shadow", "-2px 0px 3px #C0C0C0");
            }, 0);
        }
    },

    // Renders the actual button
    render: function () {
        return React.createElement("img", {src: "https://s3.amazonaws.com/gdcreative-general/HNselectXtab_orange.png", id: "sidebutton", width: "30px", onClick: this.closeBox});
    }
});

//End basic Sidebar functionality
//==========================================================

//Header

var OwnerInfo = React.createClass({displayName: "OwnerInfo",
    render: function () {
        return (
            React.createElement("div", null, 
                React.createElement("div", {id: "owner-box", className: "col-md-6 col-sm-6 col-xs-6"}, 
                    React.createElement("div", {id: "owner-name"}, 
                        React.createElement("h2", {className: "nav-title"}, username)
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

var NavBar = React.createClass({displayName: "NavBar",
    componentDidMount: function () {
        var self = this;
        var newsfeed = "This right cheer is some newsfeed thingy";
        self.props.initialState(newsfeed)
    },
    setTarget: function (target) {
        this.props.changeState(target);
        console.log("Target received by navbar: ", target);
    },
    render: function () {
        var self = this;
        var changeParentState = function (target) {
            self.props.changeState(target)
        };
        return (
            React.createElement("div", {id: "navbar-bar"}, 
                React.createElement("div", {id: "navbar-buttons", className: "row"}, 
                    React.createElement("ul", null, 
                        React.createElement("li", null, 
                            React.createElement(NavButton, {changeParentState: changeParentState, buttonName: "newsfeed", buttonTarget: "Newsfeed", active: "true"})
                        ), 
                        React.createElement("li", null, 
                            React.createElement(NavButton, {changeParentState: changeParentState, buttonName: "notifications", buttonTarget: "Notifications"})
                        ), 
                        React.createElement("li", null, 
                            React.createElement(NavButton, {changeParentState: changeParentState, buttonName: "connections", buttonTarget: "Connections"})
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
            )
        );
    }
});

var NavButton = React.createClass({displayName: "NavButton",

    handleClick: function () {
        var self = this;
        self.props.changeParentState(self.props.buttonTarget);
    },

    render: function () {
        return (
            React.createElement("div", {className: "col-md-3 col-sm-3 col-xs-3 navbar-button", id: this.props.buttonName, onClick: this.handleClick}, this.props.buttonName)
        )
    }
})

// End header
//=====================================================================

// Main content area

var ContentHolder = React.createClass({displayName: "ContentHolder",

    render: function () {
        return (
            React.createElement("div", {id: "visible"}, 
                React.createElement("div", {className: "absposition", id: "news"}, 
                    React.createElement(Newsfeed, null)
                ), 
                React.createElement("div", {className: "absposition", id: "noti"}, 
                    React.createElement(Notifications, null)
                ), 
                React.createElement("div", {className: "absposition", id: "conn"}, 
                    React.createElement(Connections, null)
                )
            )
        )
    }
})

var timeToNow = function (timestamp) {
    var now = Date()
    //console.log(now)
    var since = now - timestamp
    if (since < 3600000) return Math.floor(since / 60000) + " minutes ago";
    else return Math.floor(since / 360000) + "hours ago";
}




var Newsfeed = React.createClass({displayName: "Newsfeed",

    getInitialState: function () {
        return {
            data: null
        }
    },

    initialArticleLoad: function () {
        var self = this;

        if (!initialLoadHasTakenPlace) {
            chrome.runtime.sendMessage({
                method: 'GET',
                action: 'ajax',
                url: server + '/user/' + username + '/newsfeed',
                data: ''
            }, function (response) {
                if (response && response !== 'Not Found') {
                    console.log(response);
                    newsfeed = response.newsfeed;
                    lastItemFromDB = response.lastItem;
                    following = response.following;
                    console.log(lastItemFromDB);
                    self.setState({data: newsfeed});
                } else {
                    self.setState({data: null});
                }
            })
            initialLoadHasTakenPlace = true;
        }
    },

    articleUpdate: function () {
        var self = this;
        maxItemFb.on('value', function (snapshot) {
            setTimeout(function () {
                var maxItem = snapshot.val();
                if (!lastItemFetched)
                    lastItemFetched = lastItemFromDB;
                console.log(lastItemFetched, maxItem);
                var nextItem = lastItemFetched + 1;
                if (maxItem > nextItem) {
                    self.newItemsToFetch(nextItem, maxItem);
                }
            }, 10000);
        })
    },

    newItemsToFetch: function (start, end) {
        var self = this,
            newNewsfeedItems = [],
            promiseArray = []
        for (var i = start; i <= end; i++) {
            var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/' + i + '.json';
            $.get(itemUrl)
                .then(function (newNewsfeedItem) {
                    if (true) { // following.indexOf(response.by) > -1
                        if (newNewsfeedItem.type === "comment") {
                            fetchParent(newNewsfeedItem.parent);
                            function fetchParent(parentId) {
                                var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/' + parentId + '.json';
                                $.get(itemUrl)
                                    .then(function (response){
                                        if (response.type === "story") {
                                            newNewsfeedItem.storytitle = response.title;
                                            newNewsfeedItem.storyurl = response.url;
                                            newNewsfeedItem.storyby = response.by;
                                            newNewsfeedItem.storyid = response.id;
                                            newsfeed = [newNewsfeedItem].concat(newsfeed)
                                            self.setState({data: newsfeed});
                                        } else {
                                            fetchParent(response.parent);
                                        }
                                    });
                                }
                        } else if (response.type === "story") {
                            newsfeed = [newNewsfeedItem].concat(newsfeed)
                            self.setState({data: newsfeed});
                        }
                    }
                });
        }
    },
/*
    getItemAtUrl: function (url) {

        return new bluebird(function (resolve, reject) {



        });

    },

    newItemsToFetch2: function (start, end) {

        var i = start;
        var promises = [];

        for (; i <= end; i++) {

            var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/' + i + '.json';



        }



    },
*/
    componentDidMount: function () {
        this.initialArticleLoad();
        this.articleUpdate();
    },

    render: function () {
        if (this.state.data) {
            return (
                React.createElement("div", null, 
                    this.state.data.map(function (item) {
                        return React.createElement(NewsfeedItem, {data: item})
                    })
                )
            )
        } else {
            return React.createElement("h6", {className: "feed-title"}, "Could not retrieve data from server. Chrome extension might not have fully loaded yet. Please try reloading the page");
        }
    }
});

var NewsfeedItem = React.createClass({displayName: "NewsfeedItem",
    // Determine whether data object is a comment or a news article and render accordingly
    render: function () {
        // you cannot render different items here!
        if (this.props.data.type === "story") {
            return (
                React.createElement("div", {className: "feed-box"}, 
                    React.createElement("div", {className: "feed-titlebox"}, 
                        React.createElement("a", {href: this.props.data.storyurl, target: "_blank"}, 
                            React.createElement("h4", {className: "feed-title"}, this.props.data.storytitle)
                        ), 
                        React.createElement("p", {className: "feed-context"}, 
                            React.createElement("a", {className: "feed-author", href: hnUrl + '/user?id=' + this.props.data.by}, this.props.data.by, " | "), " ", this.props.data.time, " |", 
                            React.createElement("a", {href: hnUrl + '/item?id=' + this.props.data.id}, "comments")
                        )
                    ), 
                    React.createElement("div", {className: "feed-content"}, 
                        React.createElement("p", {className: "feed-text"}, "ARTICLE CONTENT")
                    )
                )
            )
        } else if (this.props.data.type === "comment") {
            return (
                React.createElement("div", {className: "feed-box"}, 
                    React.createElement("div", {className: "feed-titlebox"}, 
                        React.createElement("div", {className: "feed-title"}, 
                            React.createElement("a", {href: this.props.data.storyurl, target: "_blank"}, 
                            this.props.data.storytitle
                            )
                        ), 
                        React.createElement("div", {className: "feed-context"}, 
                            React.createElement("a", {href: hnUrl + '/user?id=' + this.props.data.storyby}, this.props.data.storyby, " | "), " ", this.props.data.time, " |", 
                            React.createElement("a", {href: hnUrl + '/item?id=' + this.props.data.id}, "comments")
                        )
                    ), 
                    React.createElement("div", {className: "feed-content"}, 
                        React.createElement("a", {className: "feed-author", href: hnUrl + '/item?id=' + this.props.data.id}, this.props.data.by + '\'s comment: '), 
                        React.createElement("span", {className: "feed-text", dangerouslySetInnerHTML: {__html: this.props.data.text}})
                    )
                )
            )
        }
    }
});

var Notifications = React.createClass({displayName: "Notifications",
    render: function () {
        return React.createElement("div", null, "Notifications");
    }
})

var Connections = React.createClass({displayName: "Connections",
    render: function () {
        return (
            React.createElement("div", null, 
                React.createElement("h3", {id: "connectionsubhead"}, "Find a user:"), 
                React.createElement("div", {className: "row"}, 
                    React.createElement("div", {className: "col-lg-12 col-md-12 col-sm-12 col-xs-12"}, 
                        React.createElement("div", {className: "input-group input-group-sm"}, 
                            React.createElement("input", {type: "text", className: "form-control", placeholder: "Search"}), 
                                React.createElement("span", {className: "input-group-btn"}, 
                                    React.createElement("button", {className: "btn btn-default", type: "button"}, "Follow")
                                )
                        )
                    )
                ), 
                React.createElement("div", null, 
                    React.createElement("h4", {className: "connectionhead"}, "Users you follow:"), 
                    React.createElement("div", {className: "suggest-tags"}, 
                        React.createElement("ul", null, 
                            React.createElement("li", null, "userName")
                        )
                    )
                ), 
                React.createElement("div", null, 
                    React.createElement("h4", {className: "connectionhead"}, "Users who follow you:"), 
                    React.createElement("div", {className: "suggest-tags"}, 
                        React.createElement("ul", null, 
                            React.createElement("li", null, "userName")
                        )
                    )
                )
            )
        )
    }
})






},{}]},{},[1]);
