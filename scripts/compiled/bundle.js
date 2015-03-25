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
// Fake data
var newsFeedPlaceholder = [
    {
        type: "comment",
        title: null,
        url: null,
        score: null,
        by: "erbdex",
        timestamp: "1427125337000",
        text: "You win the internet sir. Bravo.",
        commenton: "Cake made of pure awesomeness",
        parent_poster: "You",
        no_of_comments: 43
    },
    {
        type: "news",
        title: "Images that fool computer vision raise security concerns",
        url: "cornell.edu",
        score: null,
        by: "lm60",
        timestamp: "1427124617000",
        text: "Computers are learning to recognize objects with near-human ability. But Cornell researchers have found that computers, like humans, can be fooled by optical illusions, which raises security concerns and opens new avenues for research in computer vision.\nCornell graduate student Jason Yosinski and colleagues at the University of Wyoming Evolving Artificial Intelligence Laboratory have created images that look to humans like white noise or random geometric patterns but which computers identify with great confidence as common objects. They will report their work at the IEEE Computer Vision and Pattern Recognition conference in Boston June 7-12.",
        commenton: null,
        parent_poster: null,
        no_of_comments: 54
    },
    {
        type: "comment",
        title: null,
        url: null,
        score: null,
        by: "lm60",
        timestamp: "1427123297000",
        text: "While I largely agree with you, it strikes me that you've missed an option -- It might be that there's something inefficient in the trial process that holds no weight on \"fairness\". I'm not a legal expert by any means, so it may not be the case, but it seems as though it's a possibility.",
        commenton: "Amtrak police use of passenger data",
        parent_poster: "CapitalistCartr",
        no_of_comments: 91
    },
    {
        type: "comment",
        title: null,
        url: null,
        score: null,
        by: "lm60",
        timestamp: "1427122517000",
        text: "This always frustrates me when discussions of plea bargaining and the right to trial come up, and the argument is given that plea bargaining is a necessity because the courts would be horribly overloaded if every case went to trial. If the system doesn't have the resources to give every accused criminal a fair trial, then either you're making too many criminals, the system doesn't have enough resources, or both. Bypassing trials is just a way to cover your ears and shout \"la la la\" to ignore the problem.",
        commenton: "Amtrak police use of passenger data",
        parent_poster: "msandford",
        no_of_comments: 91
    },
    {
        type: "news",
        title: "Early posts from Larry Page, Linus Torvalds, Jan Koum, and more",
        url: "carlcheo.com",
        score: null,
        by: "carlcheo",
        timestamp: "1427121797000",
        text: "Here’s a list of early posts from tech founders who used to ask questions, self-promote, and interact on forums and discussion groups. Just like us. Fascinating? Yes. I see passion too.\n#1. Google (1996) – When developing Google, Larry Page posted a Java question about setting User-Agent header for his web crawler. Even the smartest people have questions too. Let me Google the answer for you, Larry.",
        commenton: null,
        parent_poster: null,
        no_of_comments: 145
    },
    {
        type: "comment",
        title: null,
        url: null,
        score: null,
        by: "lm60",
        timestamp: "1427121497000",
        text: "If everyone is breaking so many laws that the police and courts can't keep up it doesn't mean that humanity is broken. It means that the law has gotten so far out of sync with humanity that the law is broken. People make the laws, not the other way around. The world would be a much better place if more people realized this.",
        commenton: "Amtrak police use of passenger data",
        parent_poster: "msandford",
        no_of_comments: 91
    },
    {
        type: "news",
        title: "How to save datetimes for future events",
        url: "creativedeletion.com",
        score: null,
        by: "laut",
        timestamp: "1427120717000",
        text: "Imagine that it’s January 2015 and you’re making an appointment in a calendar application for a meeting that will take place in Santiago, Chile on the April 30th at 10:00 in the morning.\nYour calendar software saves the appointment and you can see that it’s there with the description that you made. 2015-04-30 10:00 in Chile. You even checked the box to get a reminder and think to yourself: “What a time to be alive”. Software can remind us of meetings and keep track of timezones and we no longer have to carry around big bulky paper calendars.",
        commenton: null,
        parent_poster: null,
        no_of_comments: 23
    },
    {
        type: "news",
        title: "Canada's CSE cyberwarfare toolbox revealed",
        url: "cbc.ca",
        score: null,
        by: "colinprince",
        timestamp: "1427119937000",
        text: "Online gambling, to a cash-hungry province, must look like a ripe piece of fruit just waiting to be plucked.\nThe logic is easy to see. Gambling on the internet is already happening, so why shouldn't a province get a piece of the action rather than watch the money go elsewhere? What's more, government oversight can keep players safe from shady offshore operators, and protect problem gamblers from themselves by promoting responsible gaming practices.\nOntario used those arguments before jumping into internet gambling in January. Quebec, B.C., and Manitoba are equally well versed in the rationale and Atlantic Canada's gambling overseer is using it right now in a bid to expand the menu of online gaming options available on the East Coast.",
        commenton: null,
        parent_poster: null,
        no_of_comments: 86
    },
]

//==========================================================
// Sidebar container and slider functionality

// Attaches an empty div to the DOM to which we can attach our React code
$(document).ready(function () {
    $("body").append("<div id='sidebar-anchor'></div>");
    React.render(React.createElement(SidebarBox, {data: newsFeedPlaceholder}), $("#sidebar-anchor").get(0));
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
            React.createElement("div", {id: "sidebarcontentarea", className: "container-fluid"}, 
                React.createElement("div", {id: "nav-area"}, 
                    React.createElement("div", {className: "row"}, 
                        React.createElement(OwnerInfo, null)
                    ), 
                    React.createElement("div", {id: "horiz-rule"}), 
                    React.createElement(NavBar, null)
                ), 
                React.createElement(ContentList, {data: this.props.data})
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
            React.createElement("div", {id: "navbar-buttons", class: "row"}, 
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
    console.log(now)
    var since = now - timestamp
    if (since < 3600000) return Math.floor(since / 60000) + " minutes ago";
    else return Math.floor(since / 360000) + "hours ago";
}

var ContentList = React.createClass({displayName: "ContentList",
    render: function () {
        // Determine whether data object is a comment or a news article and render accordingly
        var newsOrComment = this.props.data.map(function (obj) {
            if (obj.type == "news") {
                return (React.createElement("div", {className: "content-box"}, 
                    React.createElement("div", {className: "content-title"}, 
                        React.createElement("h3", {className: "content-maintitle"}, obj.title), 
                        React.createElement("h4", {className: "content-secondarytitle"}, " (", obj.url, ")")
                    ), 
                    React.createElement("div", {className: "content-content"}, 
                        React.createElement("p", {className: "content-text"}, obj.text)
                    ), 
                    React.createElement("div", {className: "content-footer"}, 
                        React.createElement("p", {className: "content-footertext"}, "by ", obj.by, " ", timeToNow(obj.timestamp), " | ", obj.no_of_comments, " comments")
                    )
                ));
            }
            else {
                return (React.createElement("div", {className: "content-box"}, 
                    React.createElement("div", {className: "content-title"}, 
                        React.createElement("h4", {className: "content-secondarytitle"}, "Comment on "), 
                        React.createElement("h3", {className: "content-maintitle"}, obj.commenton), 
                        React.createElement("h4", {className: "content-secondarytitle"}, " by ", obj.by)
                    ), 
                    React.createElement("div", {className: "content-content"}, 
                        React.createElement("p", {className: "content-text"}, obj.text)
                    ), 
                    React.createElement("div", {className: "content-footer"}, 
                        React.createElement("p", {className: "content-footertext"}, "original post by ", obj.parent_poster, " ", timeToNow(obj.timestamp), " | ", obj.no_of_comments, " comments")
                    )
                ));
            }
        })

        return (React.createElement("div", {className: "content-top"}, 
        newsOrComment
        ));
    }
});

//var ContentItem = React.createClass({
//    render: function () {
//        return
//        return <div className="content-box">
//            <div className="content-title">
//                <h3 className="content-maintitle">{obj.title}</h3>
//                <h4 className="content-secondarytitle">({obj.url})</h4>
//            </div>
//            <div className="content-content">
//                <p className="content-text">{obj.text}</p>
//            </div>
//            <div className="content-footer">
//                <p className="content-footertext">by {obj.by} {timeToNow(obj.timestamp)} | {obj.no_of_comments} comments</p>
//            </div>
//        </div>;
//    }
//});





},{}]},{},[1]);
