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
    React.render(<SidebarBox />, $("#sidebar-anchor").get(0));
});


// Sidebar component
var SidebarBox = React.createClass({

    displayName: 'SidebarBox',

    closeDrawer: function(){
        this.setState({drawerIsClosed: !this.state.drawerIsClosed});
    },

    isDrawerClosed: function(){
        var self=this;
        chrome.storage.local.get("sidebarClosed", function (result)  {
            var answer = result.toString()
            console.log("isdrawerclosed, ", answer)
            if (!answer.length) chrome.storage.local.set({sidebarClosed: false})
            else self.setState({drawerIsClosed: answer})
        })
    },

    // Attaches sidebar to the DOM and causes it to slide in
    componentDidMount: function () {
        this.isDrawerClosed();
        if (!this.state.drawerIsClosed) {
            setTimeout(function () {
                $(".sidebarbox").css({
                    right: 0
                });
                $("#sidebarcontentarea")
            }, 500)
        }

    },

    getInitialState: function () {
        return {
            target: "Newsfeed",
            userData: null,
            drawerIsClosed: false

        }
    },

    changeState: function (targetName) {
        this.setState({target: targetName})
    },

    passBookmarkProps: function (data) {
        this.setState({userData: data})
    },


    render: function () {
        var self = this;
        return (
            <div className="sidebarbox">
                <div className="sidebarbutton">
                    <CloseButton closed={this.state.drawerIsClosed} toggleSidebar={this.closeDrawer} />
                </div>
                <div className="sidebarcontentarea container container-fluid">
                    <nav id="navheight-top">
                        <div className="row top-nav nav-wrapper" id="topnav">
                            <OwnerInfo />
                        </div>
                    </nav>
                    <nav id="navheight-bottom">
                        <NavBar changeState={this.changeState} initialState={this.getInitialState} />
                    </nav>
                    <div id="feed-holder" className={this.state.target}>
                        <ContentHolder passBookmarkProps={this.passBookmarkProps} userData={this.state.data} />
                    </div>
                </div>
            </div>

        );
    }
});



// Close button component
// --> ISSUE: All these jQuery queries should be stored as variables, so we only need to access them once.
// also: we should use React, not jQuery, for this
var CloseButton = React.createClass({

    // Functionality: Button causes sidebar to slide closed if it is open, open if it is closed.
    closeBox: function () {
        var self=this;
        console.log("closed?", self.props.closed)
        if (!self.props.closed.sidebarClosed) {
            self.props.toggleSidebar();
            chrome.storage.local.set({sidebarClosed: false})
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
                self.props.toggleSidebar();
                chrome.storage.local.set({sidebarClosed: true})
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
        return <img src="https://s3.amazonaws.com/gdcreative-general/HNselectXtab_orange.png" id="sidebutton" width="30px" onClick={this.closeBox} />;
    }
});

//End basic Sidebar functionality
//==========================================================

//Header

var OwnerInfo = React.createClass({
    render: function () {
        return (
            <div>
                <div id="owner-box" className="col s6">
                    <div id="owner-name">
                        <h2 id="nav-title">
                            <img src="https://s3.amazonaws.com/gdcreative-general/HNselectlogo_white.png" height="12px" id="rvs_logo" />{username}</h2>
                    </div>
                </div>
                <div id="owner-stats" className="col s6">
                    <div className="col s4 owner-stat">
                        <div className="owner-stattitle">karma</div>
                        <div className="owner-statscore">1</div>
                    </div>
                    <div className="col s4 owner-stat">
                        <div className="owner-stattitle">following</div>
                        <div className="owner-statscore">15</div>
                    </div>
                    <div className="col s4 owner-stat">
                        <div className="owner-stattitle">followers</div>
                        <div className="owner-statscore">1</div>
                    </div>
                </div>
            </div>
        )
    }
});

var NavBar = React.createClass({
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
            <div id="navbar-bar">
                <div id="navbar-buttons" className="row">
                    <ul id={this.state.active}>
                        <li className="col s2 navbar-button waves-effect waves-light" id="nf">
                            <NavButton changeParentState={changeParentState} buttonName="newsfeed" buttonTarget="Newsfeed" />
                        </li>
                        <li className="col s2 navbar-button waves-effect waves-light" id="co">
                            <NavButton changeParentState={changeParentState} buttonName="connections" buttonTarget="Connections" />
                        </li>
                        <li className="col s2 navbar-button waves-effect waves-light" id="bm">
                            <NavButton changeParentState={changeParentState} buttonName="bookmarks" buttonTarget="Bookmarks" />
                        </li>
                        <li className="col s2" id="disablehover">
                            <div>&nbsp;</div>
                        </li>
                        <li className="col s2" id="disablehover">
                            <div>&nbsp;</div>
                        </li>
                        <li className="col s2 navbar-button waves-effect waves-light">
                            <div id="twitter">
                                <a href={"http://www.hnselect.com/user/" + username + "/twitter/connect"}>
                                    <img src="https://s3.amazonaws.com/gdcreative-general/twitter_white_circle_48.png" height="14px" />
                                </a>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
});

var NavButton = React.createClass({

    handleClick: function () {
        var self = this;
        self.props.changeParentState(self.props.buttonTarget);
    },

    render: function () {
        return (
            <div id={this.props.buttonName} onClick={this.handleClick}>{this.props.buttonName}</div>
        )
    }
})

// End header
//=====================================================================

// Main content area

var ContentHolder = React.createClass({
    passBookmarkProps: function () {
        return null;
    },
    render: function () {
        return (
            <div id="visible">
                <div className="absposition" id="news">
                    <Newsfeed />
                </div>
                <div className="absposition" id="conn">
                    <Connections passBookmarkProps={this.passBookmarkProps} />
                </div>
                <div className="absposition" id="noti">
                    <Bookmarks data={this.props.userData} />
                </div>
            </div>
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


var Newsfeed = React.createClass({

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
                <div>
                    <div id="feedbuttondiv" className={this.state.hideOrShow} onClick={this.updateNewsfeed}>
                        <a className="waves-effect waves-ripple btn" id="feedbutton" href="#">
                            <p id="feedbuttontext">&uarr;New Items</p>
                        </a>
                    </div>
                    <div>
                    {this.state.data.map(function (item) {
                        if (item.type === "story") {
                            return <StoryItem data={item} />
                        } else if (item.type === "comment") {
                            //console.log(item.text)
                            return <CommentItem data={item} />
                        }
                    })}
                    </div>
                </div>
            )
        } else {
            return <h6 className="feed-title">Could not retrieve data from server. Chrome extension might not have fully loaded yet. Please try reloading the page</h6>;
        }
    }
});

var StoryItem = React.createClass({
    render: function () {
        return (
            <div className="feed-box">
                <div className="feed-titlebox">
                    <div className="feed-title truncate">
                        <a href={this.props.data.storyurl} target="_blank">
                            {this.props.data.storytitle}
                        </a>
                    </div>
                    <div className="feed-context">
                        by&nbsp;
                        <a className="feed-author" href={hnUrl + '/user?id=' + this.props.data.by}>{this.props.data.by} | </a> {this.props.data.time} |
                        <a href={hnUrl + '/item?id=' + this.props.data.storyid}> all comments</a>
                    </div>
                </div>
                <div className="feed-content">
                    <p className="feed-text">{this.props.data.text}</p>
                </div>
            </div>
        )
    }
});

var CommentItem = React.createClass({
    render: function () {
        return (
            <div className="feed-box">
                <div className="feed-titlebox">
                    <div className="feed-title">
                        <a href={this.props.data.storyurl} target="_blank">
                        {this.props.data.storytitle}
                        </a>
                    </div>
                    <div className="feed-context">
                        by&nbsp;
                        <a href={hnUrl + '/user?id=' + this.props.data.storyby} id="feedlink">{this.props.data.storyby} | </a> {this.props.data.time} |
                        <a href={hnUrl + '/item?id=' + this.props.data.storyid}> all comments</a>
                    </div>
                </div>
                <div className="feed-content">
                    <a className="feed-author" href={hnUrl + '/item?id=' + this.props.data.id}>{this.props.data.by + '\'s comment: '}</a>

                    <span className="feed-text" dangerouslySetInnerHTML={{__html: this.props.data.text}} />
                </div>
            </div>
        )
    }
});

var userData,
    followingArr = [];

var Connections = React.createClass({

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

    passUserData: function (data) {
        this.props.passBookmarkProps(data)
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
            //console.log(response)
            if (response && response !== 'Not Found') {
                userData = response;
                self.setState({data: userData});
                self.passUserData(self.state.data);
                //console.log(userData);
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
                <span>It looks like you&#39;re not following anyone. Would you care to
                    <a href="#" onClick={self.searchFocus()}> add a user to follow now?</a>
                </span>
            )
        } else {
            //console.log("There is indeed data: ", this.state.data.following)
            return (
                <ul>
                {this.state.data.following.map(function (user) {
                    return <li ref={user} id={user} onClick={self.userRemover(user)}>{user}</li>;
                })}
                </ul>
            )
        }
    },

    showFollowers: function () {
        var self = this;
        if (self.state.data !== null && self.state.data.followers.length) {
            //console.log("There is indeed data: ", this.state.data.following)
            return (
                <ul>
                {this.state.data.followers.map(function (user) {
                    return <li ref={user} id={user} onClick={self.userRemover(user)}>{user}</li>;
                })}
                </ul>
            )
        }
    },

    showSuggestedFollowers: function () {
        var self = this;
        if (self.state.data !== null && self.state.data.suggestedFollowing.length) {
            //console.log("There is indeed data: ", this.state.data.following)
            return (
                <ul>
                {this.state.data.suggestedFollowing.map(function (user) {
                    return <li ref={user} id={user} onClick={self.userRemover(user)}>{user}</li>;
                })}
                </ul>
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
        } else {
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
            <div>
                <div className="row">
                    <form className="col s12" id="inputForm">
                        <div className="row">
                            <div className="input-field col s12">
                                <label htmlFor="searchFollow">Follow a Hacker News user</label>
                                <input id="searchFollow" value={value} onChange={this.handleChange} type="text" className="validate" />
                                <button id="ourbutton" className="btn btn-default" type="button" onClick={this.followInputUser}>Follow</button>
                            </div>
                        </div>
                    </form>
                </div>
                <div>
                    <h3 id="following-title">{this.state.connHead}
                        <a href="#" id="connedit" onClick={this.enableEdit}>{this.state.editOrDelete}</a>
                    </h3>
                    <div className="suggest-tags">
                        {this.showUsers()}
                    </div>

                </div>
                <div>
                    <h3 id="suggested-following-title">Suggested Followers including your Twitter connections
                        <a href="#" id="connedit" onClick={this.enableEdit}>{this.state.editOrDelete}</a>
                    </h3>
                    <div className="suggest-tags">
                        {this.showSuggestedFollowers()}
                    </div>
                    
                </div>
                <div>
                    <h3 id="followers-title">Users that follow you
                        <a href="#" id="connedit" onClick={this.enableEdit}>{this.state.editOrDelete}</a>
                    </h3> 
                    <div className="suggest-tags">
                        {this.showFollowers()}
                    </div>                   
                </div>
            {/*<div>
             <h4 className="connectionhead">Users who follow you:</h4>
             <div className="suggest-tags">
             <ul>
             <li>userName</li>
             </ul>
             </div>
             </div>*/}
            </div>
        )
    }
});

// Get userdata.bookmarks

var bookmarkData;

var Bookmarks = React.createClass({

    getInitialState: function () {
        return {
            data: null
        }

    },

    getBookmarks: function (server, username) {
        var self = this;
        //console.log("Getting called")
        chrome.runtime.sendMessage({
            method: 'GET',
            action: 'ajax',
            url: server + '/user/' + username + '/bookmarks',
            data: ''
        }, function (response) {
            //console.log(response)
            if (response && response !== 'Not Found') {
                console.log("Bookmarks response, ", response)
                bookmarkData = response;
                self.setState({data: bookmarkData});
            } else {
                self.setState({data: null});
            }
        })
    },

    componentDidMount: function(){
        this.getBookmarks(server, username)
    },

    render: function () {
        var self=this;
        //console.log("Bookmarks: ", this.state.data)
        if (self.state.data) {
            return (
                <div>
                    {self.state.data.map(function (item) {
                        if (item.type === "story") {
                            return <StoryItem data={item} />
                        } else if (item.type === "comment") {
                            //console.log(item.text)
                            return <CommentItem data={item} />
                        }
                    })}
                </div>
            )
        }
                else return <div>You don't have any bookmarks!</div>
    }
})
