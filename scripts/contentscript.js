'use strict';

// Constants
var hnOrange = '#ff6600',
    commentsBgColor = hnOrange,
    commentsTitleColor = hnOrange,
    authorColor = hnOrange,
    commentersTextColor = "#ffffff",
    commentersBgColor = hnOrange,
    bgGrey = "#f7f7f1",
    following = ['rickdale','colechristensen','jseliger','annbabe','mathouc','j2kun','concise','taejo','cpursley','mavdi', 'nkozyra', 'kazinator','comex','robin_reala','revscat','jakke','aestetix', 'ymmt2005', 'epetre', 'Graham24', 'datascientist', 'danso', 'gsans', 'adventured', 'epetre'],
    getCommentersRoute = 'http://hn-select.herokuapp.com/getCommenters';


// Selecting highlighting method depending on view
var tabUrl = window.location.href;
var tabQuery = window.location.search;
if (tabQuery || tabUrl.indexOf('newcomments') > -1 ) {
  console.log(' > Highlighting comments');
  highlightComments();
} else {
  console.log(' > Highlighting stories');
  highlightNews();
}


function highlightNews() {
  var storiesOnPage = [],
      storyIdsOnPage = [];
  $('a[href^="user?id"').each(function(index){
    var $user = $(this);
    var user = $user.text();
    if (following.indexOf(user) > -1) {
      var $storyTitle = $user.parents('tr:first').prev('tr').find('a[href^="http"]');
      var storyId = $user.next('a[href^="item?id"]').attr('href').replace('item?id=','');
      storiesOnPage.push({
        storyId: storyId,
        $storyTitle: $storyTitle,
        $user: $user
      })
      storyIdsOnPage.push(storyId);
    }
  });
  $.post(getCommentersRoute, storyIdsOnPage)
    .then(function(response) {
  // TESTING backend functionality
  // var returnedObject = {};
  // for (var s = 0; s < storiesOnPage.length; s++) {
  //   var storyId = storiesOnPage[s].storyId;
  //   returnedObject[storyId] = ['jseliger','annbabe','mathouc'];
  // }
  // var response = {};
  // response.data = returnedObject;
      var commentersFollowing = response.data // needs to be an object with key:value pairs storyId:[following by]
      for (var i = 0; i < storiesOnPage.length; i++) {
        // Check whether commentersFollowing includes storyId, i.e. whether people I am following commented
        if (commentersFollowing[storiesOnPage[i].storyId]) {
          var storyCommenters = commentersFollowing[storiesOnPage[i].storyId]
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
      story.$storyTitle.css({color: commentsTitleColor, 'font-weight': 'bold'});
      story.$user.css({color: authorColor, 'font-weight': 'bold'});
      // Add commenters
      if (story.commenters) {
        var commenters = story.commenters;
        for (var c = 0; c < commenters.length; c++) {
          var commentersElement = "<a href='https://news.ycombinator.com/user?id=" + commenters[c] + "'> " + commenters[c] + " </a>";
          var $commentersElement = $(commentersElement).css({color: commentersTextColor, 'font-weight': 'bold', 'background-color': commentersBgColor})
          var $toInsert = $("<span>&nbsp</span>").css("background-color", bgGrey).append($commentersElement);
          story.$user.nextAll().eq(1).after($toInsert);
        }
      }
    }
  }

}


function highlightComments() {
  $('a[href^="user?id"').each(function(index){
    var user = $(this).text();
    if (following.indexOf(user) > -1) {
      $(this).parents('td:first').css({'background-color': commentsBgColor});
      $(this).css({'color': commentersTextColor, 'font-weight': 'bold'});
      $(this).nextAll().css({'color': commentersTextColor});
    }
  });
}
