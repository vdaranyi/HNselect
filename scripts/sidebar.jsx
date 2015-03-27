// Constants

var server = 'http://localhost:3000';
var username = 'glennonymous';

//==========================================================
// Sidebar container and slider functionality

// Attaches an empty div to the DOM to which we can attach our React code
$(document).ready(function () {
    $("body").append("<div id='sidebar-anchor'></div>");
    React.render(<SidebarBox />, $("#sidebar-anchor").get(0));
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
                            <NavBar />
                        </div>
                        <div id="content-holder">
                        <ContentList data={this.props.data} />
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
        return <img src="https://s3.amazonaws.com/gdcreative-general/HNselectXtab.png" id="sidebutton" width="30px" onClick={this.closeBox} />;
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


var OwnerInfo = React.createClass({
    render: function () {
        return (
            <div>
                <div id="owner-box" className="col-md-6 col-sm-6 col-xs-6">
                    <div id="owner-name">
                        <h2 className="nav-title">glennonymous</h2>
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

// Suggestions (suggestionarea)

var SuggestionArea = React.createClass({
    render: function () {
        return <div id="suggest-box" className="col-md-6 col-sm-6 col-xs-6">
            <div id="suggest-title">
            {/*<h2 className="nav-title">Who to follow</h2>*/}
            </div>
            <div id="suggest-tags">
            {/*<ul>
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
             </ul>*/}
            </div>
            <SearchForm />
        </div>;
    }
});

// Search form
// - input
// - submit

var SearchForm = React.createClass({
    render: function () {
        return <div id="search-box">
        {/*<div className="input-group">
         <input type="text" className="form-control" placeholder="Search" />
         <span className="input-group-btn">
         <button className="btn btn-default" type="button">Submit</button>
         </span>
         </div>*/}
        </div>;
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

var NavBar = React.createClass({
    render: function () {
        return <div id="navbar-bar">
            <div id="navbar-buttons" className="row">
                <ul>
                    <li>
                        <div className="col-md-3 col-sm-3 col-xs-3 navbar-button" id="newsfeed" active="true">newsfeed</div>
                    </li>
                    <li>
                        <div className="col-md-3 col-sm-3 col-xs-3 navbar-button" id="notifications">notifications</div>
                    </li>
                    <li>
                        <div className="col-md-3 col-sm-3 col-xs-3 navbar-button" id="connections">connections</div>
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
        </div>;
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

var ContentList = React.createClass({

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
                <div>
                    {this.state.data.map(function (item) {
                        return <ContentItem data={item} />
                    })}
                </div>
            ) 
        } else {
            return <h6 className="content-maintitle">Could not retrieve data from server</h6>;
        } 
    }
});

var ContentItem = React.createClass({
    // Determine whether data object is a comment or a news article and render accordingly
    render: function(){
        if (this.props.data.type === "story") {
            return (
                <div className="content-box">
                    <div className="content-title">
                        <h3 className="content-maintitle">{this.props.data.title}</h3>
                        <h4 className="content-secondarytitle">{this.props.data.url})</h4>
                    </div>
                    <div className="content-content">
                        <p className="content-text">{this.props.data.text}</p>
                    </div>
                    <div className="content-footer">
                        <p className="content-footertext">by {this.props.data.by} {timeToNow(this.props.data.timestamp)} | {this.props.data.no_of_comments} comments</p>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="content-box">
                    <div className="content-title">
                        <h4 className="content-secondarytitle">Comment on </h4>
                        <h3 className="content-maintitle">{this.props.data.commenton}</h3>
                        <h4 className="content-secondarytitle"> by {this.props.data.by}</h4>
                    </div>
                    <div className="content-content">
                        <p className="content-text" dangerouslySetInnerHTML={{__html: this.props.data.text}} />
                    </div>
                    <div className="content-footer">
                        <p className="content-footertext">original post by {this.props.data.parent_poster} {timeToNow(this.props.data.timestamp)} | {this.props.data.no_of_comments} comments</p>
                    </div>
                </div>
            );
        }
    }
});



