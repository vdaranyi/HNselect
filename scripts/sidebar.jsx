// Constants

var server = 'http://hn-select.herokuapp.com';
var hnUrl = "https://news.ycombinator.com";

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
            <div className="sidebarbox">
                <div className="sidebarbutton">
                    <CloseButton />
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
                        <ContentHolder />
                    </div>
                </div>
            </div>

        );
    }
});

var drawerIsClosed = false;

// Close button component
// --> ISSUE: All these jQuery queries should be stored as variables, so we only need to access them once.
var CloseButton = React.createClass({

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
                        <h2 id="nav-title"><img src="https://s3.amazonaws.com/gdcreative-general/HNselectlogo_white.png" height="12px" id="rvs_logo" />{username}</h2>
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
    componentDidMount: function () {
        var self = this;
        var newsfeed = "This right cheer is some newsfeed thingy";
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
        };
        return (
            <div id="navbar-bar">
                <div id="navbar-buttons" className="row">
                    <ul>
                        <li>
                            <NavButton changeParentState={changeParentState} buttonName="newsfeed" buttonTarget="Newsfeed" />
                        </li>
                        <li>
                            <NavButton changeParentState={changeParentState} buttonName="connections" buttonTarget="Connections" />
                        </li>
                        <li>
                            <NavButton changeParentState={changeParentState} buttonName="bookmarks" buttonTarget="Bookmarks" />
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
            <div className="col s3 navbar-button" id={this.props.buttonName} onClick={this.handleClick}>{this.props.buttonName}</div>
        )
    }
})

// End header
//=====================================================================

// Main content area

var ContentHolder = React.createClass({

    render: function () {
        return (
            <div id="visible">
                <div className="absposition" id="news">
                    <Newsfeed />
                </div>
                <div className="absposition" id="noti">
                    <Notifications />
                </div>
                <div className="absposition" id="conn">
                    <Connections />
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
                    if (true) { // following.indexOf(newNewsfeedItem.by) > -1
                        if (newNewsfeedItem.type === "comment") {
                            fetchParent(newNewsfeedItem.parent);
                            function fetchParent(parentId) {
                                var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/' + parentId + '.json';
                                $.get(itemUrl)
                                    .then(function (response) {
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
                        } else if (newNewsfeedItem.type === "story") {

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
                <div>
                    {this.state.data.map(function (item) {
                        if (item.type === "story") {
                            return <StoryItem data={item} />
                        } else if (item.type === "comment") {
                            return <CommentItem data={item} />
                        }
                    })}
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
                    <h4 className="feed-title">
                        <a href={this.props.data.storyurl} target="_blank">
                            {this.props.data.storytitle}
                        </a>
                    </h4>
                    <p className="feed-context">
                        by
                        <a className="feed-author" href={hnUrl + '/user?id=' + this.props.data.by}>{this.props.data.by} | </a> {this.props.data.time} |
                        <a href={hnUrl + '/item?id=' + this.props.data.storyid}> all comments</a>
                    </p>
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
                        by
                        <a href={hnUrl + '/user?id=' + this.props.data.storyby}>{this.props.data.storyby} | </a> {this.props.data.time} |
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


var Notifications = React.createClass({
    render: function () {
        return <div>Notifications</div>;
    }
})

var userData,
    followingArr = [];

var Connections = React.createClass({

    getInitialState: function () {
        return {
            data: null,
            value: "",
            errorMessage: ""
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
            if (response && response !== 'Not Found') {
                userData = response;
                self.setState({data: userData});
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
        console.log("Show users, ", this.state)
        // Are we allowed to build an if/else statement in here, i.e. returning different html components?
        if (this.state.data === null) {
            return (
                <span>It looks like you&#39;re not following anyone. Would you care to
                    <a href="#" onClick={this.searchFocus()}>add a user to follow now?</a>
                </span>
            )
        } else {
            //console.log("There is indeed data: ", this.state.data.following)
            return (
                <ul>
                {this.state.data.following.map(function (user) {
                    return <li>{user}</li>;
                })}
                </ul>
            )
        }
    },
    handleChange: function (event) {
        this.setState({value: event.target.value});
    },
    followInputUser: function () {
        var self = this,
            followUser = self.state.value;
        //console.log(followUser)
        //console.log("Getting called, ", this.state.data.following)
        if (this.state.data.following.indexOf(followUser) !== -1) {
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
    },

    render: function () {
        var value = this.state.value;
        console.log('VALUE', value);
        return (
            <div>
                <h3 id="connectionsubhead">Find a user:</h3>
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="input-group input-group-sm">
                            <input type="text" className="form-control" id="searchFollow" value={value} onChange={this.handleChange} placeholder="Search" />
                            <span className="input-group-btn">
                                <button className="btn btn-default" type="button" onClick={this.followInputUser}>Follow</button>
                            </span>
                        </div>
                        <div>
                        {this.errorMessage}
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="connectionhead">Users you follow:</h4>
                    <div className="suggest-tags">
                        {this.showUsers()}
                    </div>
                </div>
                <div>
                    <h4 className="connectionhead">Users who follow you:</h4>
                    <div className="suggest-tags">
                        <ul>
                            <li>userName</li>
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
});





