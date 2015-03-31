//console.log('pageHighlighting');
var server = 'http://hn-select.herokuapp.com';
var hnOrange = '#ff6600',
    hnGrey = '#828282',
    commentsBgColor = hnOrange,
    commentsTitleColor = hnOrange,
    authorColor = hnOrange,
    commentersTextColor = "#ffffff",
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
            if (highlightData[s].author.length) {
                stories[s].$storyTitle.css({color: commentsTitleColor, 'font-weight': 'bold'});
                commenterStyling(stories[s].$author, 'story');
            }   
            if (highlightData[s].commenters.length) {
                var commenters = highlightData[s].commenters;
                for (var c = 0; c < commenters.length; c++) {
                    var commentersElement = "<a href='https://news.ycombinator.com/user?id=" + commenters[c] + "'> " + commenters[c] + " </a>";
                    //console.log(commentersElement, 'comment');
                    var $commentersElement = commenterStyling($(commentersElement));
                    stories[s].$author.nextAll().eq(1).after($commentersElement);
                }
            }   
        }
    }

    function commenterStyling($authorDomElem, type) {
        $authorDomElem.css({
            color: commentersTextColor,
            'font-weight': 'bold',
            'background-color': commentersBgColor
        });
        if (type === 'story') {
            $authorDomElem.prepend("<span>&nbsp</span>").append("<span>&nbsp</span>");
        } else {
            var $toInsert = $("<span>&nbsp</span>").css("background-color", bgGrey).append($authorDomElem);
            return $toInsert;
        }
    }
}


// NOT YET FUNCTIONAL
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





