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






},{"./pageHighlighting.js":2,"./sidebar.jsx":3}],2:[function(require,module,exports){
//console.log('pageHighlighting');
var server = 'http://www.hnselect.com';
//var server = 'http://hn-select.herokuapp.com';
// var server = 'http://localhost:3000';
var hnOrange = '#ff6600',
    hnGrey = '#828282',
    commentsBgColor = hnOrange,
    commentsTitleColor = hnOrange,
    authorColor = hnOrange,
    commentersTextColor = 'black',
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
            addBookmarkButton($storyTitle, storyId, user);
            addPlusButton($author, author, user);
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
                //console.log(highlightData);
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
            stories[s].$storyTitle.css({color: commentsTitleColor});
            if (highlightData[s].author.length) {
                commenterStyling(stories[s].$author, 'story');
            }   
            if (highlightData[s].commenters.length) {
                var commenters = highlightData[s].commenters;
                for (var c = 0; c < commenters.length; c++) {
                    var commentersElement = "<a href='https://news.ycombinator.com/user?id=" + commenters[c] + "'> " + commenters[c] + " </a>";
                    //console.log(commentersElement, 'comment');
                    var $commentersElement = commenterStyling($(commentersElement));
                    stories[s].$author.nextAll().eq(2).after($commentersElement);
                }
            }   
        }
    }

    function commenterStyling($authorDomElem, type) {
        $authorDomElem.css({
            color: commentersTextColor,
            'font-weight': 'bold',
        });
        if (type === 'story') {
            $authorDomElem.prepend("<span>&nbsp</span>").append("<span>&nbsp</span>");
        } else {
            var $toInsert = $("<span>&nbsp</span>").css("background-color", bgGrey).append($authorDomElem);
            return $toInsert;
        }
    }
}

function addPlusButton($author, author, user) {
    // Replace + with Glyphicon
    $plusButtonHtml = $("<span class='add-plus-button'> +</span>")
    $plusButtonHtml.insertAfter($author).click(function(){
        chrome.runtime.sendMessage({
            method: 'POST',
            action: 'ajax',
            url: server + '/user/' + user + '/followuser/' + author,
            }, function (response) {
                console.log('DONE',response);
            }
        );
    });
}

function addBookmarkButton($storyTitle, storyId, user) {
    // Replace + with Glyphicon
    $plusButtonHtml = $("<span class='add-plus-button'> +</span>")
    $plusButtonHtml.insertAfter($storyTitle).click(function(){
        chrome.runtime.sendMessage({
            method: 'POST',
            action: 'ajax',
            url: server + '/user/' + user + '/bookmark/' + storyId,
            }, function (response) {
                console.log('DONE',response);
            }
        );
    });
}


// NOT YET FUNCTIONAL
/*
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
*/







},{}],3:[function(require,module,exports){
// Constants

//var server = 'http://localhost:3000';
var server = 'http://www.hnselect.com';
var hnUrl = "https://news.ycombinator.com";
//require("./react-materialize/src/input.js");

var addFonts = document.createElement('style');
addFonts.type = 'text/css';
addFonts.textContent = '@font-face { font-family: FontAwesome; src: url("'
+ chrome.extension.getURL('https://cdnjs.cloudflare.com/ajax/libs/materialize/0.95.3/font/material-design-icons/Material-Design-Icons.eot')
+ chrome.extension.getURL('https://cdnjs.cloudflare.com/ajax/libs/materialize/0.95.3/font/material-design-icons/Material-Design-Icons.svg')
+ chrome.extension.getURL('https://cdnjs.cloudflare.com/ajax/libs/materialize/0.95.3/font/material-design-icons/Material-Design-Icons.ttf')
+ chrome.extension.getURL('https://cdnjs.cloudflare.com/ajax/libs/materialize/0.95.3/font/roboto/Roboto-Bold.ttf')
+ chrome.extension.getURL('https://cdnjs.cloudflare.com/ajax/libs/materialize/0.95.3/font/roboto/Roboto-Light.ttf')
+ chrome.extension.getURL('https://cdnjs.cloudflare.com/ajax/libs/materialize/0.95.3/font/roboto/Roboto-Medium.ttf')
+ chrome.extension.getURL('https://cdnjs.cloudflare.com/ajax/libs/materialize/0.95.3/font/roboto/Roboto-Regular.ttf')
+ chrome.extension.getURL('https://cdnjs.cloudflare.com/ajax/libs/materialize/0.95.3/font/roboto/Roboto-Thin.ttf')
+ '"); }';
document.head.appendChild(addFonts);

// TO DO
// Change server, change following indexOf check


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
    },

    render: function () {
        var self = this;
        return (
            React.createElement("div", {className: "sidebarbox"}, 
                React.createElement("div", {className: "sidebarbutton"}, 
                    React.createElement(CloseButton, null)
                ), 
                React.createElement("div", {className: "sidebarcontentarea container container-fluid"}, 
                    React.createElement("nav", {id: "navheight-top"}, 
                        React.createElement("div", {className: "row top-nav nav-wrapper", id: "topnav"}, 
                            React.createElement(OwnerInfo, null)
                        )
                    ), 
                    React.createElement("nav", {id: "navheight-bottom"}, 
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
                React.createElement("div", {id: "owner-box", className: "col s6"}, 
                    React.createElement("div", {id: "owner-name"}, 
                        React.createElement("h2", {id: "nav-title"}, 
                            React.createElement("img", {src: "https://s3.amazonaws.com/gdcreative-general/HNselectlogo_white.png", height: "12px", id: "rvs_logo"}), username)
                    )
                ), 
                React.createElement("div", {id: "owner-stats", className: "col s6"}, 
                    React.createElement("div", {className: "col s4 owner-stat"}, 
                        React.createElement("div", {className: "owner-stattitle"}, "karma"), 
                        React.createElement("div", {className: "owner-statscore"}, "1")
                    ), 
                    React.createElement("div", {className: "col s4 owner-stat"}, 
                        React.createElement("div", {className: "owner-stattitle"}, "following"), 
                        React.createElement("div", {className: "owner-statscore"}, "15")
                    ), 
                    React.createElement("div", {className: "col s4 owner-stat"}, 
                        React.createElement("div", {className: "owner-stattitle"}, "followers"), 
                        React.createElement("div", {className: "owner-statscore"}, "1")
                    )
                )
            )
        )
    }
});

var NavBar = React.createClass({displayName: "NavBar",
    getInitialState: function () {
        return {active: "NewsfeedActive"}
    },
    componentDidMount: function () {
        var self = this;
        //var newsfeed = "This right cheer is some newsfeed thingy";
        self.props.initialState(newsfeed)
    },
    setTarget: function (target) {
        this.props.changeState(target);
        //console.log("Target received by navbar: ", target);
    },
    render: function () {
        var self = this;
        var changeParentState = function (target) {
            self.props.changeState(target)
            self.setState({active: target + "Active"})
        };
        return (
            React.createElement("div", {id: "navbar-bar"}, 
                React.createElement("div", {id: "navbar-buttons", className: "row"}, 
                    React.createElement("ul", {id: this.state.active}, 
                        React.createElement("li", {className: "col s2 navbar-button waves-effect waves-light", id: "nf"}, 
                            React.createElement(NavButton, {changeParentState: changeParentState, buttonName: "newsfeed", buttonTarget: "Newsfeed"})
                        ), 
                        React.createElement("li", {className: "col s2 navbar-button waves-effect waves-light", id: "co"}, 
                            React.createElement(NavButton, {changeParentState: changeParentState, buttonName: "connections", buttonTarget: "Connections"})
                        ), 
                        React.createElement("li", {className: "col s2 navbar-button waves-effect waves-light", id: "bm"}, 
                            React.createElement(NavButton, {changeParentState: changeParentState, buttonName: "bookmarks", buttonTarget: "Bookmarks"})
                        ), 
                        React.createElement("li", {className: "col s2", id: "disablehover"}, 
                            React.createElement("div", null, " ")
                        ), 
                        React.createElement("li", {className: "col s2", id: "disablehover"}, 
                            React.createElement("div", null, " ")
                        ), 
                        React.createElement("li", {className: "col s2 navbar-button waves-effect waves-light"}, 
                            React.createElement("div", {id: "twitter"}, React.createElement("a", {href: "http://www.hnselect.com/user/" + username + "/twitter/connect"}, React.createElement("img", {src: "https://s3.amazonaws.com/gdcreative-general/twitter_white_circle_48.png", height: "14px"})))
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
            React.createElement("div", {id: this.props.buttonName, onClick: this.handleClick}, this.props.buttonName)
        )
    }
})

// End header
//=====================================================================

// Main content area

var ContentHolder = React.createClass({displayName: "ContentHolder",
    passBookmarkProps: function () {
        return null;
    },
    render: function () {
        return (
            React.createElement("div", {id: "visible"}, 
                React.createElement("div", {className: "absposition", id: "news"}, 
                    React.createElement(Newsfeed, null)
                ), 
                React.createElement("div", {className: "absposition", id: "conn"}, 
                    React.createElement(Connections, {passBookmarkProps: this.passBookmarkProps})
                ), 
                React.createElement("div", {className: "absposition", id: "noti"}, 
                    React.createElement(Bookmarks, null)
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
            data: null,
            tempNewsfeed: [],
            hideOrShow: "hide"
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
                    newsfeed = response.newsfeed;
                    lastItemFromDB = response.lastItem;
                    following = response.following;
                    //console.log(lastItemFromDB);
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
        for (var i = start; i <= end; i++) { // 9311348
            var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/' + i + '.json';
            promiseArray.push(
                $.get(itemUrl)
                    .then(function (newNewsfeedItem) {
                        if (newNewsfeedItem) { // following.indexOf(newNewsfeedItem.by) > -1
                            if (newNewsfeedItem.type === "comment") {
                                return fetchParent(newNewsfeedItem.parent);
                                function fetchParent(parentId) {
                                    var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/' + parentId + '.json';
                                    return $.get(itemUrl)
                                        .then(function (response) {
                                            if (response.type === "story") {
                                                newNewsfeedItem.storytitle = response.title;
                                                newNewsfeedItem.storyurl = response.url;
                                                newNewsfeedItem.storyby = response.by;
                                                newNewsfeedItem.storyid = response.id;
                                                newsfeed = [newNewsfeedItem].concat(newsfeed);
                                                self.setState({tempNewsfeed: newsfeed});
                                            } else {
                                                return fetchParent(response.parent);
                                            }
                                        }, function (err) {
                                            console.log("here is the error: ", err);
                                            return;
                                        });
                                }
                            } else if (newNewsfeedItem.type === "story") {

                                newsfeed = [newNewsfeedItem].concat(newsfeed)
                                self.setState({tempNewsfeed: newsfeed});
                            }
                        }
                    }, function (err) {
                        console.log("here is another error: ", err);
                        return;
                    })
            );
        }
        $.when.apply($, promiseArray)
            .done(function () {
                console.log(i, ' all updated > refresh');
                self.setState({hideOrShow: "show"});
            });
    },

    updateNewsfeed: function () {
        var self = this
        self.setState({
            data: this.state.tempNewsfeed,
            hideOrShow: "hide"
        });
    },

    componentDidMount: function () {
        this.initialArticleLoad();
        this.articleUpdate();
    },

    render: function () {
        if (this.state.data) {
            return (
                React.createElement("div", null, 
                    React.createElement("div", {id: "feedbuttondiv", className: this.state.hideOrShow, onClick: this.updateNewsfeed}, 
                        React.createElement("a", {className: "waves-effect waves-ripple btn", id: "feedbutton", href: "#"}, 
                            React.createElement("p", {id: "feedbuttontext"}, "↑New Items")
                        )
                    ), 
                    React.createElement("div", null, 
                    this.state.data.map(function (item) {
                        if (item.type === "story") {
                            return React.createElement(StoryItem, {data: item})
                        } else if (item.type === "comment") {
                            //console.log(item.text)
                            return React.createElement(CommentItem, {data: item})
                        }
                    })
                    )
                )
            )
        } else {
            return React.createElement("h6", {className: "feed-title"}, "Could not retrieve data from server. Chrome extension might not have fully loaded yet. Please try reloading the page");
        }
    }
});

var StoryItem = React.createClass({displayName: "StoryItem",
    render: function () {
        return (
            React.createElement("div", {className: "feed-box"}, 
                React.createElement("div", {className: "feed-titlebox"}, 
                    React.createElement("div", {className: "feed-title truncate"}, 
                        React.createElement("a", {href: this.props.data.storyurl, target: "_blank"}, 
                            this.props.data.storytitle
                        )
                    ), 
                    React.createElement("div", {className: "feed-context"}, 
                        "by ", 
                        React.createElement("a", {className: "feed-author", href: hnUrl + '/user?id=' + this.props.data.by}, this.props.data.by, " | "), " ", this.props.data.time, " |", 
                        React.createElement("a", {href: hnUrl + '/item?id=' + this.props.data.storyid}, " all comments")
                    )
                ), 
                React.createElement("div", {className: "feed-content"}, 
                    React.createElement("p", {className: "feed-text"}, this.props.data.text)
                )
            )
        )
    }
});

var CommentItem = React.createClass({displayName: "CommentItem",
    render: function () {
        return (
            React.createElement("div", {className: "feed-box"}, 
                React.createElement("div", {className: "feed-titlebox"}, 
                    React.createElement("div", {className: "feed-title"}, 
                        React.createElement("a", {href: this.props.data.storyurl, target: "_blank"}, 
                        this.props.data.storytitle
                        )
                    ), 
                    React.createElement("div", {className: "feed-context"}, 
                        "by ", 
                        React.createElement("a", {href: hnUrl + '/user?id=' + this.props.data.storyby, id: "feedlink"}, this.props.data.storyby, " | "), " ", this.props.data.time, " |", 
                        React.createElement("a", {href: hnUrl + '/item?id=' + this.props.data.storyid}, " all comments")
                    )
                ), 
                React.createElement("div", {className: "feed-content"}, 
                    React.createElement("a", {className: "feed-author", href: hnUrl + '/item?id=' + this.props.data.id}, this.props.data.by + '\'s comment: '), 

                    React.createElement("span", {className: "feed-text", dangerouslySetInnerHTML: {__html: this.props.data.text}})
                )
            )
        )
    }
});

var userData,
    followingArr = [];

var Connections = React.createClass({displayName: "Connections",

    getInitialState: function () {
        return {
            data: null,
            value: "",
            errorMessage: "",
            remove: null,
            editEnabled: false,
            connHead: "Users you follow:",
            editOrDelete: "Edit",
            selectedToRemove: "unselected",
            usersToDelete: []
        }
    },

    getUserData: function (server, username) {
        var self = this;
        //console.log("Getting called")
        chrome.runtime.sendMessage({
            method: 'GET',
            action: 'ajax',
            url: server + '/user/' + username + '/userdata',
            data: ''
        }, function (response) {
            console.log(response)
            if (response && response !== 'Not Found') {
                userData = response;
                self.setState({data: userData});
                console.log(userData);
            } else {
                self.setState({data: null});
            }
        })
    },

    componentDidMount: function () {
        this.getUserData(server, username);
    },

    searchFocus: function () {
        $("#searchFollow").focus();
    },

    showUsers: function () {
        var self = this;
        //console.log("Show users, ", this.state)
        // Are we allowed to build an if/else statement in here, i.e. returning different html components?
        if (self.state.data === null) {
            return (
                React.createElement("span", null, "It looks like you're not following anyone. Would you care to", 
                    React.createElement("a", {href: "#", onClick: self.searchFocus()}, "add a user to follow now?")
                )
            )
        } else {
            //console.log("There is indeed data: ", this.state.data.following)
            return (
                React.createElement("ul", null, 
                this.state.data.following.map(function (user) {
                    return React.createElement("li", {ref: user, id: user, onClick: self.userRemover(user)}, user);
                })
                )
            )
        }
    },
    enableEdit: function () {
        var self = this;
        if (!self.state.editEnabled) {
            self = this;
            self.setState({
                editOrDelete: "Unfollow",
                connHead: "Select which users you want to stop following.",
                editEnabled: true
            });
        }
        else {
            self.deleteUsers(this.state.usersToDelete);
            self.setState({
                editEnabled: false,
                editOrDelete: "Edit"
            });

        }
    },
    userRemover: function (user) {
        var self = this;
        return function clickHandler() {
            //console.log('!! Clicked the button');
            if (self.state.editEnabled) {
                var me = self.refs[user].props.children;
                console.log(me);
                $("#" + me).attr('class', 'toBeDeleted');
                self.state.usersToDelete.push(me);
                console.log(self.state.usersToDelete);
                self.setState.usersToDelete = self.state.usersToDelete;
            }
        }
    },
    deleteUsers: function (arr) {
        var self = this;
        $('.toBeDeleted').remove();
        chrome.runtime.sendMessage({
            method: 'DELETE',
            action: 'ajax',
            url: server + '/user/' + username + '/unfollowuser',
            data: arr
        }, function (response) {
            console.log("Response: ", response)
        });

    },
    handleChange: function (event) {
        this.setState({value: event.target.value});
    },
    followInputUser: function () {
        var self = this,
            followUser = self.state.value;
        if (self.state.data.following.indexOf(followUser) !== -1) {
            // Find out if the user already exists in their following; if so, give them a message
            self.setState({errorMessage: "It appears you are already following this user. Would you like to try again?"})
        } else {
            chrome.runtime.sendMessage({
                method: 'GET',
                action: 'ajax',
                url: 'https://hacker-news.firebaseio.com/v0' + '/user/' + followUser + '.json?print=pretty',
                data: ''
            }, function (response) {

                if (response !== null) {
                    chrome.runtime.sendMessage({
                        method: 'POST',
                        action: 'ajax',
                        url: server + '/user/' + username + '/followuser/' + followUser,
                    }, function (response) {
                        console.log("Response: ", response);
                        if (response == "User added") {
                            self.state.data.following.push(followUser)
                            self.setState({data: self.state.data});
                        } else {
                            self.setState({errorMessage: "There appears to be a server error. Would you like to try again?"});
                        }
                    });
                } else {
                    self.setState({errorMessage: "It appears this user either doesn't exist or has never posted on Hacker News. Would you like to try again?"});
                }
            })
        }
        this.setState({value: ''});
    },

    render: function () {
        var value = this.state.value;
        //console.log('VALUE', value);
        return (
            React.createElement("div", null, 
                React.createElement("div", {class: "row"}, 
                    React.createElement("form", {class: "col s12", id: "inputForm"}, 
                        React.createElement("div", {class: "row"}, 
                            React.createElement("div", {class: "input-field col s12"}, 
                                React.createElement("label", {htmlFor: "searchFollow"}, "Follow a Hacker News user"), 
                                React.createElement("input", {id: "searchFollow", value: value, onChange: this.handleChange, type: "text", className: "validate"}), 
                                React.createElement("button", {id: "ourbutton", className: "btn btn-default", type: "button", onClick: this.followInputUser}, "Follow")
                            )
                        )
                    )
                ), 
                React.createElement("div", null, 
                    React.createElement("h3", {id: "connectionhead"}, this.state.connHead, 
                        React.createElement("a", {href: "#", id: "connedit", onClick: this.enableEdit}, this.state.editOrDelete)
                    ), 
                    React.createElement("div", {className: "suggest-tags"}, 
                        this.showUsers()
                    )
                )
            /*<div>
             <h4 className="connectionhead">Users who follow you:</h4>
             <div className="suggest-tags">
             <ul>
             <li>userName</li>
             </ul>
             </div>
             </div>*/
            )
        )
    }
});

var Bookmarks = React.createClass({displayName: "Bookmarks",

    render: function () {
            return (
                React.createElement("div", null, 
                    "Bookmarks"
                )
            )
    }
})


},{}]},{},[1]);
