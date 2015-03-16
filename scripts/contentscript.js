'use strict';

// Constants
var hnOrange = '#ff6600',
    commentsBgColor = hnOrange,
    commentsTitleColor = hnOrange,
    authorColor = hnOrange,
    commentersTextColor = "#ffffff",
    commentersBgColor = hnOrange,
    bgGrey = "#f7f7f1",
    following = ['nkurz','rickdale','colechristensen','jseliger','annbabe','mathouc','j2kun','concise','taejo','cpursley','mavdi', 'nkozyra', 'kazinator','comex','robin_reala','revscat','jakke','aestetix', 'ymmt2005', 'epetre', 'Graham24', 'datascientist', 'danso', 'gsans', 'adventured', 'epetre'],
    getCommentersRoute = 'https://localhost:3000/getCommenters';
    // getCommentersRoute = 'https://hn-select.herokuapp.com/getCommenters';


// Selecting highlighting method depending on view
var tabUrl = window.location.href;
var tabQuery = window.location.search;
if (tabQuery.indexOf('item?id') > -1 || tabUrl.indexOf('newcomments') > -1 ) {
  console.log(' > Highlighting comments');
  highlightComments();
} else {
  console.log(' > Highlighting stories');
  highlightNews();
}


function highlightNews() {
  var storiesOnPage = [],
      storyIdsOnPage = [],
      user;
  $('a[href^="user?id"]').each(function(index){
    if (index === 0) {
      user = $(this).text();
    } else {
      var $author = $(this);
      var author = $author.text();
      var $storyTitle = $author.parents('tr:first').prev('tr').find('a[href^="http"]');
      var storyId = $author.next('a[href^="item?id"]').attr('href').replace('item?id=','');

      // Put all stories on page into array for subsequent comment following analysis
      storiesOnPage.push({
        storyId: storyId,
        $storyTitle: $storyTitle,
        $author: $author,
        author: author,
        commenters: []
      })
      storyIdsOnPage.push(storyId);n // ONLY NEEDED FOR SERVER REQUEST
      
    }
  });
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

  function highlightFollowing(storiesOnPage) {
    for (var s = 0; s < storiesOnPage.length; s++) {
      var story = storiesOnPage[s];
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
          var $commentersElement = $(commentersElement).css({color: commentersTextColor, 'font-weight': 'bold', 'background-color': commentersBgColor})
          var $toInsert = $("<span>&nbsp</span>").css("background-color", bgGrey).append($commentersElement);
          story.$author.nextAll().eq(1).after($toInsert);
        }
      }
    }
  }

}


function highlightComments() {
  $('a[href^="user?id"]').each(function(index){
    var author = $(this).text();
    if (following.indexOf(author) > -1) {
      $(this).parents('td:first').css({'background-color': commentsBgColor});
      $(this).css({'color': commentersTextColor, 'font-weight': 'bold'});
      $(this).nextAll().css({'color': commentersTextColor});
    }
  });
}

// Ajax requests to HN Firebase API





