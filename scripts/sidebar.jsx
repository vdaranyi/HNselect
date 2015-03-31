// Constants

var server = 'http://localhost:3000';
var hnUrl = "https://news.ycombinator.com";

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
        console.log("Target received by Parent: ", targetName);
    },

    render: function () {
        var self = this;
        return (
            <div className="sidebarbox">
                <div className="sidebarbutton">
                    <CloseButton />
                </div>
                <div id="sidebarcontentarea"  className="container-fluid">
                    <div id="nav-area">
                        <div className="row">
                            <OwnerInfo />
                        </div>
                        <div id="horiz-rule"></div>
                        <NavBar changeState={this.changeState} initialState={this.getInitialState} />
                    </div>
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
                <div id="owner-box" className="col-md-6 col-sm-6 col-xs-6">
                    <div id="owner-name">
                        <h2 className="nav-title">{username}</h2>
                    </div>
                </div>
                <div id="owner-stats" className="col-md-6 col-sm-6 col-xs-6">
                    <div className="col-md-4 col-sm-4 col-xs-4 owner-stat">
                        <div className="owner-stattitle">karma</div>
                        <div className="owner-statscore">1</div>
                    </div>
                    <div className="col-md-4 col-sm-4 col-xs-4 owner-stat">
                        <div className="owner-stattitle">following</div>
                        <div className="owner-statscore">15</div>
                    </div>
                    <div className="col-md-4 col-sm-4 col-xs-4 owner-stat">
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
        console.log("Target received by navbar: ", target);
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
                            <NavButton changeParentState={changeParentState} buttonName="newsfeed" buttonTarget="Newsfeed" active="true" />
                        </li>
                        <li>
                            <NavButton changeParentState={changeParentState} buttonName="notifications" buttonTarget="Notifications" />
                        </li>
                        <li>
                            <NavButton changeParentState={changeParentState} buttonName="connections" buttonTarget="Connections" />
                        </li>
                        <li>
                            <div className="col-md-1 col-sm-1 col-xs-1 navbar-button" />
                        </li>
                        <li>
                            <div className="col-md-1 col-sm-1 col-xs-1 navbar-button navbar-button-right" id="favorites">
                                <img src="https://s3.amazonaws.com/gdcreative-general/star_64_gray.png" width="13px" />
                            </div>
                        </li>
                        <li>
                            <div className="col-md-1 col-sm-1 col-xs-1 navbar-button navbar-button-right" id="settings">
                                <img src="https://s3.amazonaws.com/gdcreative-general/gear_64_gray.png" width="13px" />
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
            <div className="col-md-3 col-sm-3 col-xs-3 navbar-button" id={this.props.buttonName} onClick={this.handleClick}>{this.props.buttonName}</div>
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
                    if (true) { // following.indexOf(newNewsfeedItem.by) > -1
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
                        by <a className="feed-author" href={hnUrl + '/user?id=' + this.props.data.by}>{this.props.data.by} | </a> {this.props.data.time} |
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
    render: function() {
        return (
            <div className="feed-box">
                <div className="feed-titlebox">
                    <div className="feed-title">
                        <a href={this.props.data.storyurl} target="_blank">
                        {this.props.data.storytitle}
                        </a>
                    </div>
                    <div className="feed-context">
                        by <a href={hnUrl + '/user?id=' + this.props.data.storyby}>{this.props.data.storyby} | </a> {this.props.data.time} |
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

var Connections = React.createClass({
    render: function () {
        return (
            <div>
                <h3 id="connectionsubhead">Find a user:</h3>
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="input-group input-group-sm">
                            <input type="text" className="form-control" placeholder="Search" />
                                <span className="input-group-btn">
                                    <button className="btn btn-default" type="button">Follow</button>
                                </span>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 className="connectionhead">Users you follow:</h4>
                    <div className="suggest-tags">
                        <ul>
                            <li>userName</li>
                        </ul>
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
})




