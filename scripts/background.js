'use strict';
// Add error handling

// Fetch data from HNSelect server
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    //console.log(request);
    if (request.action == 'ajax') {
        if (request.method == 'GET') {
            $.getJSON(request.url, function(response){
                callback(response);
            })
        } else {
            $.ajax({
              url: request.url,
              type: request.method,
              dataType: "xml/html/script/json", // expected format for response
              contentType: "application/json", // send as JSON
              data: JSON.stringify(request.data)
            })
            .always(function (data){
                callback(data.responseText);
            })
        }
    }
    return true;
});

// OAuth Process
// =============

// var oauth = ChromeExOAuth.initBackgroundPage({
//   'request_url': 'https://api.twitter.com/oauth/request_token',
//   'authorize_url': 'https://api.twitter.com/oauth/authorize',
//   'access_url': 'https://api.twitter.com/oauth/access_token',
//   'consumer_key': 'anonymous', // twitter.consumerKey,
//   'consumer_secret':  'anonymous', // twitter.consumerSecret,
//   // 'scope': <scope of data access, not used by all OAuth providers>,
//   'app_name': 'hn-select'
// });

// function getFollowing(twitterHandle) {
//   oauth.authorize(function() {
//     console.log("on authorize");
//     // setIcon();
//     var url = "https://api.twitter.com/1.1/friends/list.json";
//     var cursor = -1 // first result page
//     var queryString = '?cursor='+cursor+'&screen_name='+twitterHandle+'&count=200&skip_status=true&include_user_entities=false';
//     oauth.sendSignedRequest(url + queryString, callback);
//   });
// };

// function callback(resp, xhr) {
//   // Send following to backend
// };

// getFollowing('crsmnd');
