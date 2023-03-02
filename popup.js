$(function() {
  // Send a message to content.js to fetch all the top domains
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {"message": "fetch_top_domains"});
  });

  // Add a listener to handle the response from content.js
  chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // wait for a message from the content script
      if( request.message === "all_urls_fetched" ) {
        // run over all urls found
        for ( var key in request.data ) {
          if(request.data.hasOwnProperty(key)) {
            // dispaly all links to different domain from the one I'm in
            $('#tabs_table tr:last').after('<tr><td>' + key +'</td></tr>');
          }
        }
      }
    }
  );
});

