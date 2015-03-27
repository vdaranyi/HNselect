// Whenever Firebase pings us that a new article is available --Firebase gives us maxitems
// - we check to see what the maxitems of last ping was and make an AJAX request to get all between items
// get it and check if it is:
// - By someone we are following
// - A comment on an article we posted
// - A direct comment to a comment we posted
// If it is, add it to newsfeed


var followingList = ["peterhunt","espadrine", "mdewinter", "robin_reala"];

function iterateOverItems(start, end, following) {
    var newsArray = [];
    for (var i=end; i<start; i--) {
        for (var j=following.length-1; j=0; j--) {
            newsArray.push(fetchItems(i, following(j)));
        }
    }
    return newsArray;
}


function fetchItems(itemId, commenters) {
    var itemUrl = 'https://hacker-news.firebaseio.com/v0/item/' + itemId + '.json?print=pretty';
    // console.log(commenters);

    // console.log(counter);
    $.get(itemUrl)
        .then(function (response) {
            counter--;
            // Iterating over the comments recursively
            if (typeof response === 'object') {
                // Add commenter
                var commenter = response.by;
                // console.log(commenter);
                if (commenters.indexOf(commenter) === -1 && following.indexOf(commenter) > -1) {
                    commenters.push(commenter);
                    // NEED TO INCLUDE CHECK WHETHER TO REMOVE STORY AUTHOR
                }
                if (response.kids) {
                    console.log(response.kids);
                    var children = response.kids;
                    counter += children.length;
                    totalcount += children.length;
                    children.forEach(function (childId, index) {
                        // console.log(childId, index);
                        // console.log();
                        fetchItems(childId, commenters);
                        // return commenters;
                    });

                }
            }

            if (counter === 0) {

                // Remove author
                var authorIndex = commenters.indexOf(author)
                if (authorIndex > -1) {
                    commenters.splice(authorIndex, 1);
                    // console.log('*** AUTHOR REMOVED');
                }
                // console.log('DONE', totalcount, counter, commenters);
                // Adding commenters to story object
                story.commenters = commenters;
                // Highlight
                //highlightFollowing(story);
            }
        })
    // .then(function(response){
    //   console.log('FINAL',commenters);
    //   highlightFollowing(storiesOnPage);
    // });
}
