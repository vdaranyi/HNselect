'use strict';

//==========================================================
// Sidebar

//var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

$(document).ready(function () {
    $("body").append("<div id='sidebar-anchor'></div>");
    React.render(<SidebarBox />, $("#sidebar-anchor").get(0));
});

//var SidebarContentArea = React.createClass({
//    componentDidMount: function ()
//})

var SidebarBox = React.createClass({

    displayName: 'SidebarBox',

    // Set the initial state to cause the div to slide in.

    componentDidMount: function () {
        setTimeout(function () {
            $(".sidebarbox").css({
                right: 0
            });
            $("#sidebarcontentarea")
        }, 500)

    },


    render: function () {
        return <div className="sidebarbox">
            <div className="sidebarbutton">
                <CloseButton />
            </div>
            <div id="sidebarcontentarea">
                //<topnav />
                //<tabnav />
            </div>
        </div>;
    }

});

var drawerIsClosed = false;

var CloseButton = React.createClass({

    // Button causes box to slide out.

    closeBox: function () {
        if (!drawerIsClosed) {
            drawerIsClosed = true;
            setTimeout(function () {
                $(".sidebarbox").css({
                    "right": "-470"
                });
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
                $("#sidebutton").attr("src", "https://s3.amazonaws.com/gdcreative-general/HNselectXtab.png");
                $("#sidebarcontentarea").css("box-shadow", "-2px 0px 3px #C0C0C0");
            }, 0);
        }
    },

    render: function () {
        return <img src="https://s3.amazonaws.com/gdcreative-general/HNselectXtab.png" id="sidebutton" width="30px" onClick={this.closeBox} />;
    }
})

//var topNav = React.createClass({
//
//})

//End Sidebar
//==========================================================

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



