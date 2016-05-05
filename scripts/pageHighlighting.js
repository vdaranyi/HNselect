//console.log('pageHighlighting');
// var server = 'http://www.hnselect.com';
var server = 'http://hn-select.herokuapp.com';
// var server = 'http://localhost:3000';
var hnOrange = '#ff6600',
    hnGrey = '#828282',
    commentsBgColor = hnOrange,
    commentsTitleColor = hnOrange,
    authorColor = hnOrange,
    commentersTextColor = 'black',
    commentersBgColor = hnGrey,
    bgGrey = "#f7f7f1";


parseHnPage();

function parseHnPage() {
    var storiesOnPage = {},
        storyIdsOnPage = [],
        highlightData;

    
    var user = $('span.pagetop').last().children('a[href]').attr('href');
    if (user.indexOf('login') === 0) {
        
        // Replace alert with request in sidebar to login! 
        alert('To use HNselect, please log into HN first');
        
        // Stop code execution of extension. Return not sufficient!
        return;
    } else {
        user = user.replace('user?id=', '');
    }

    $('.subtext').each(function (index) {        
        var story = {};
        var $author = $(this).children('a[href^="user?id"]');
        var author = $author.text();
        var $storyTitle = $(this).parents('tr:first').prev('tr').find('a[href^="http"]');
        
        // Check if it is a story, otherwise skip (i.e. Jobs, e.g. https://news.ycombinator.com/item?id=11639942)
        try {
            var storyId = $author.parent().children('span').find('a[href^="item?id"]').attr('href').replace('item?id=', '');
        }
        catch(err) {
            return true; // go to next .each iteration
        }

        // console.log(user, index, $author, $storyTitle, storyId);

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





