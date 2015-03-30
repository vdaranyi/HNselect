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
        } else if (request.method == 'POST') {
            $.ajax({
              url: request.url,
              type: "POST",
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