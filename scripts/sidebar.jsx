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
        return <div className="sidebarbox">
            <div className="sidebarbutton">
                <CloseButton />
            </div>
            <div id="sidebarcontentarea">
                <OwnerInfo />
                <SuggestionArea />
                <NavBar />
                <ContentArea />
            </div>
        </div>;
    }

});

var drawerIsClosed = false;

// Close button component
// --> ISSUE: All these jQuery queries should be stored as variables, so we only need to access them once.
var CloseButton = React.createClass({

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
        return <div id="owner-box">
            <div id="owner-name">
                <h2>glennonymous</h2>
            </div>
            <div id="owner-stats">
                <div className="owner-stat">
                    <div className="owner-stattitle">Karma</div>
                    <div className="owner-statscore">1</div>
                </div>
                <div className="owner-stat">
                    <div className="owner-stattitle">Following</div>
                    <div className="owner-statscore">15</div>
                </div>
                <div className="owner-stat">
                    <div className="owner-stattitle">Followers</div>
                    <div className="owner-statscore">1</div>
                </div>
            </div>
        </div>;
    }
});

// Suggestions (suggestionarea)

var SuggestionArea = React.createClass({
    render: function () {
        return <div id="suggest-box">
            <div id="suggest-title">
                <h2>Who to follow</h2>
            </div>
            <div id="suggest-tags">
                <ul>
                    <li>joefred</li>
                    <li>fredbob</li>
                    <li>aprilmay</li>
                    <li>june1972</li>
                    <li>aLincoln</li>
                    <li>aynRandy</li>
                </ul>
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
            <div class="input-group">
                <input type="text" class="form-control" placeholder="Search for people to follow" />
                <span class="input-group-btn">
                    <button class="btn btn-default" type="button">Submit</button>
                </span>
            </div>
        </div>;
    }
});

// Navbar
// - Feed
// - Updates
// - Connections
// - Favorites
// - Settings

var NavBar = React.createClass({
    render: function () {
        return <div id="navbar-bar">
            <div id="navbar-buttons">
                <ul>
                    <li><span id="navbar-feed">Feed</span></li>
                    <li><span id="navbar-updates">Updates</span></li>
                    <li><span id="navbar-connections">Connections</span></li>
                    <li><span class="glyphicon glyphicon-star" id="navbar-favorites" aria-hidden="true" /></li>
                    <li><Gear id="navbar-settings" /></li>
                </ul>
            </div>
            <SearchForm />
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

var ContentArea = React.createClass({
    render: function () {
        return <div id="content-box">
            <div id="content-title"><span id=""></span></div>
            <div id="content-content"><span id=""></span></div>
        </div>;
    }
});

// Gear icon

var Gear = React.createClass({
    render: function () {
        return <svg xmlns="http://www.w3.org/2000/svg"><path d="M12.793,10.327c0.048-0.099,0.097-0.196,0.138-0.298c0.012-0.023,0.018-0.049,0.028-0.072 c0.03-0.079,0.06-0.158,0.086-0.238c0.005-0.013,0.01-0.023,0.014-0.038c0.008-0.021,0.016-0.041,0.023-0.063L16,8.889V7.111 l-2.918-0.73c-0.009-0.024-0.019-0.047-0.027-0.071c0-0.003-0.001-0.008-0.003-0.012c-0.028-0.085-0.06-0.17-0.093-0.253 c-0.011-0.025-0.018-0.05-0.028-0.075c-0.044-0.107-0.095-0.208-0.144-0.312c-0.011-0.02-0.02-0.04-0.029-0.06 c-0.008-0.015-0.015-0.03-0.021-0.044l1.55-2.582l-1.258-1.258l-2.583,1.549c-0.011-0.005-0.021-0.01-0.031-0.016 c-0.03-0.014-0.059-0.027-0.086-0.041c-0.1-0.047-0.195-0.096-0.298-0.138c-0.025-0.011-0.053-0.019-0.077-0.028 C9.879,3.012,9.804,2.984,9.727,2.958C9.711,2.952,9.694,2.946,9.678,2.94c-0.021-0.007-0.04-0.015-0.061-0.022L8.889,0H7.111 L6.38,2.919C6.361,2.926,6.343,2.934,6.323,2.94C6.308,2.945,6.292,2.952,6.275,2.957C6.199,2.983,6.124,3.011,6.05,3.04 C6.031,3.047,6.011,3.05,5.992,3.058C5.983,3.061,5.977,3.066,5.968,3.07c-0.102,0.042-0.2,0.09-0.299,0.139 C5.644,3.222,5.617,3.233,5.592,3.246C5.58,3.253,5.566,3.258,5.555,3.264L2.973,1.715L1.715,2.972l1.55,2.581 C3.259,5.564,3.254,5.574,3.249,5.585c-0.015,0.03-0.028,0.06-0.043,0.09C3.159,5.771,3.111,5.867,3.07,5.966 c-0.012,0.029-0.02,0.058-0.031,0.086c-0.028,0.072-0.055,0.146-0.08,0.218c-0.006,0.018-0.014,0.035-0.02,0.053 C2.934,6.343,2.925,6.362,2.918,6.381L0,7.111v1.777l2.918,0.729C2.925,9.639,2.934,9.659,2.941,9.68 C2.945,9.693,2.95,9.707,2.956,9.72C2.981,9.798,3.01,9.875,3.04,9.95c0.007,0.019,0.01,0.039,0.017,0.058 c0.003,0.008,0.01,0.016,0.013,0.025c0.044,0.104,0.094,0.205,0.144,0.306c0.01,0.022,0.02,0.044,0.031,0.063 c0.007,0.014,0.013,0.028,0.02,0.043l-1.549,2.582l1.257,1.258l2.581-1.549c0.012,0.006,0.023,0.01,0.036,0.018 c0.025,0.013,0.053,0.024,0.079,0.037c0.101,0.049,0.2,0.099,0.304,0.141c0.022,0.01,0.046,0.016,0.069,0.026 c0.082,0.033,0.166,0.063,0.252,0.093c0.007,0.002,0.014,0.004,0.021,0.006c0.023,0.009,0.045,0.018,0.068,0.026L7.111,16h1.777 l0.729-2.917c0.021-0.008,0.042-0.016,0.062-0.023c0.014-0.005,0.026-0.009,0.04-0.015c0.082-0.027,0.163-0.057,0.241-0.088 c0.022-0.01,0.045-0.016,0.065-0.025c0.109-0.045,0.216-0.096,0.321-0.147c0.017-0.009,0.033-0.016,0.05-0.025 c0.017-0.007,0.032-0.015,0.048-0.022l2.582,1.55l1.258-1.259l-1.549-2.581c0.006-0.011,0.009-0.021,0.015-0.032 C12.766,10.385,12.779,10.355,12.793,10.327z M11.482,8.696c-0.019,0.092-0.054,0.179-0.08,0.269 c-0.037,0.135-0.069,0.271-0.123,0.398c-0.037,0.09-0.092,0.174-0.137,0.26c-0.062,0.119-0.118,0.244-0.192,0.354 c-0.087,0.131-0.196,0.251-0.303,0.373c-0.083,0.093-0.168,0.181-0.259,0.265c-0.133,0.122-0.271,0.241-0.417,0.341 c-0.089,0.059-0.186,0.1-0.278,0.151c-0.112,0.06-0.22,0.129-0.337,0.177c-0.094,0.038-0.195,0.061-0.293,0.092 c-0.125,0.039-0.248,0.086-0.376,0.11c-0.103,0.021-0.211,0.021-0.316,0.032c-0.25,0.025-0.499,0.025-0.748-0.001 c-0.104-0.011-0.21-0.011-0.311-0.031c-0.131-0.024-0.258-0.073-0.387-0.114c-0.094-0.03-0.192-0.051-0.282-0.088 c-0.112-0.046-0.217-0.112-0.324-0.17c-0.075-0.042-0.153-0.076-0.226-0.122c-0.021-0.015-0.047-0.024-0.068-0.038 c-0.122-0.082-0.232-0.184-0.345-0.281c-0.137-0.117-0.262-0.246-0.379-0.383c-0.087-0.104-0.181-0.203-0.254-0.312 c-0.07-0.105-0.122-0.221-0.181-0.333C4.817,9.549,4.759,9.459,4.718,9.36c-0.042-0.103-0.065-0.213-0.1-0.321 c-0.035-0.116-0.08-0.23-0.104-0.35C4.492,8.572,4.489,8.448,4.479,8.326C4.457,8.099,4.458,7.874,4.48,7.647 C4.492,7.535,4.493,7.42,4.515,7.312C4.541,7.177,4.59,7.048,4.632,6.917c0.005-0.016,0.01-0.032,0.015-0.048 c0.025-0.075,0.04-0.154,0.07-0.225c0.05-0.122,0.121-0.236,0.186-0.352C4.95,6.204,4.989,6.111,5.045,6.027 c0.103-0.153,0.227-0.296,0.356-0.436c0.064-0.07,0.132-0.136,0.203-0.201c0.135-0.125,0.273-0.246,0.423-0.345 C6.12,4.983,6.224,4.938,6.324,4.885c0.104-0.057,0.207-0.122,0.316-0.167c0.112-0.046,0.232-0.073,0.35-0.108 c0.061-0.019,0.121-0.04,0.183-0.054c0.045-0.011,0.089-0.03,0.134-0.039c0.189-0.038,0.386-0.053,0.586-0.059 c0.07-0.002,0.14-0.002,0.211,0c0.2,0.006,0.4,0.021,0.591,0.06c0.102,0.02,0.199,0.059,0.298,0.088 c0.125,0.036,0.25,0.065,0.37,0.115C9.46,4.76,9.55,4.818,9.645,4.868c0.111,0.058,0.227,0.11,0.332,0.18 c0.133,0.089,0.256,0.201,0.379,0.311c0.103,0.091,0.199,0.188,0.289,0.29c0.109,0.122,0.219,0.244,0.308,0.376 c0.071,0.104,0.121,0.221,0.181,0.333c0.049,0.094,0.107,0.184,0.147,0.279c0.053,0.126,0.085,0.262,0.122,0.395 c0.021,0.074,0.05,0.147,0.066,0.222c0.004,0.017,0.01,0.032,0.014,0.049c0.041,0.206,0.061,0.419,0.064,0.636 c0,0.026,0.005,0.053,0.005,0.08C11.55,8.25,11.525,8.477,11.482,8.696z"/></svg>;
    }
});



