// listen to a message from popup.js in order to act
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // if received the message
    if(( request.message === "fetch_top_domains" ) || ( request.message === "fetch_URLS" )){
      // get data from cuurent web page
      local = location.hostname;
      var urlHash = {};
      var links = document.links;
      
      // run over all links
      for(var i=0; i<links.length; i++) {
        // get domain name
        var domain = links[i].href.split('/')[2]
        var name = links[i].hostname;

        // need to decide if want to secuer also for redirections in the same site
        if (name != local){
          if (!urlHash[domain]) {
            urlHash[domain] = domain;
          }
        }
      }

      // send the message to popup.js
      if( request.message === "fetch_top_domains" ) {
        chrome.runtime.sendMessage({"message": "all_urls_fetched", "data": urlHash});
      }
      else{
        chrome.runtime.sendMessage({"message": "urls_fetched", "data": urlHash});
      }
    }
  }
);


