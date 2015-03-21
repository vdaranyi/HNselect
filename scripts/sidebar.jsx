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
            <div id="sidebarcontentbox">
                <ownerinfo />
                <suggestionarea />
                <navbar />
                <contentarea />
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
// username
// karma
// # of people following you
// # of people you follow

var OwnerInfo = React.createClass({
    render: function () {
        return <div id="owner-box">
            <div id="owner-name">glennonymous</div>
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
// username

var SuggestionArea = React.createClass({
    render: function () {
        return <div id="suggest-box">
            <div id="suggest-tabs">
            </div>
            <span id=""></span>
        </div>;
    }
});

// Search form
// input
// submit

var SearchForm = React.createClass({
    render: function () {
        return <div id="">
            <div id=""></div>
            <span id=""></span>
        </div>;
    }
});

// Item (contentarea)
// type
// title
// url
// score
// by
// text

var ContentArea = React.createClass({
    render: function () {
        return <div id="">
            <div id=""></div>
            <span id=""></span>
        </div>;
    }
});




