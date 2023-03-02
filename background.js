// declare variables for later use
var TheMalWords =  "";
var shortURLsBol=  true;
var longURLsBol=  true;
var malWordURLsBol=  true;
var malWordTextBol = true;
var dirty_URLs = [];
var alreadyBlocked = [];
var shouldOpenUserChoice = true;
var shouldOpenTiming = true;
var lastSite = "";

chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.local.get(["blocked", "block", "malWords","shortURLs",
   "longURLs","malWordURLs", "malWordText","index","dirty_URLs", "openUserChoice"], function (local) {
    if (!Array.isArray(local.blocked)) {
      chrome.storage.local.set({ blocked: [] });
    }
    // validate types of arguments
    if (typeof local.block !== "boolean") {
      chrome.storage.local.set({ block: false });
    }

    if (!Array.isArray(local.malWords)) {
      chrome.storage.local.set({ malWords: [] });
    }
    
    if (typeof local.shortURLs !== "boolean") {
      chrome.storage.local.set({ shortURLs: false });
    }

    if (typeof local.longURLs !== "boolean") {
      chrome.storage.local.set({ longURLs: false });
    }

    if (typeof local.malWordURLs !== "boolean") {
      chrome.storage.local.set({ malWordURLs: false });
    }

    if (typeof local.malWordText !== "boolean") {
      chrome.storage.local.set({ malWordText: false });
    }
    if (typeof local.index !== "int") {
      chrome.storage.local.set({ index: 0 });
    }
    if (!Array.isArray(local.dirty_URLs)) {
      chrome.storage.local.set({ dirty_URLs: [] });
    }
    if(typeof local.openUserChoice !== "boolean") {
      chrome.storage.local.set({ openUserChoice: true });
    }
  });
});

// check if legal values
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  const url = changeInfo.pendingUrl || changeInfo.url;
  if (!url || !url.startsWith("http")) {
    return;
  }

  // get the current url 
  const hostname = new URL(url).hostname;

  // get all blocked state sites
  chrome.storage.local.get(["blocked", "block"], function (local) {
    const { blocked, block } = local;
    // check if the new url is allowed or not
    if (Array.isArray(blocked) && block && blocked.find(domain => hostname.includes(domain))) {
      // if not allowed - close it
      chrome.tabs.remove(tabId);
    }
  });
});

// update data the extension see every 5 min
chrome.alarms.create("5min", {
  delayInMinutes: 5,
  periodInMinutes: 5
});

// alarm the extension to re-listen every 5 min to refresh data
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === "5min") {
    shouldOpenTiming = true;
  }
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  const url = changeInfo.pendingUrl || changeInfo.url;
  // check URL validity
  if (!url || !url.startsWith("http")) {
    return;
  }
  const hostname = new URL(url).hostname;
  // if same site as before - need to set to reload
  if (hostname!= lastSite){
    lastSite = hostname;
    shouldOpenTiming = true;
  }
});

// in case of change
chrome.storage.onChanged.addListener(
  // get all flags options
  chrome.storage.local.get(["blocked","malWords","shortURLs", "longURLs","malWordURLs", "malWordText","openUserChoice"], function (local) {
    const {blocked, malWords, shortURLs, longURLs, malWordURLs, malWordText, openUserChoice } = local;
    // separate words in the list by '\n' to check each one separately
    if (Array.isArray(malWords)) {
      TheMalWords = malWords.join("\n");
    }
    // set to be blocked
    if (Array.isArray(blocked)) {
      alreadyBlocked = blocked;
    }
    // save values from option page
    shortURLsBol = shortURLs;
    longURLsBol = longURLs;
    malWordURLsBol = malWordURLs;
    malWordTextBol = malWordText;
    shouldOpenUserChoice = openUserChoice;
  })
);

// in case of message sent to background
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    // wait for a message from the content script
    if( request.message === "info_updated" ) {
      chrome.storage.local.get(["blocked","malWords","shortURLs", "longURLs","malWordURLs", "malWordText","openUserChoice"], function (local) {
      const {blocked, malWords, shortURLs, longURLs, malWordURLs, malWordText, openUserChoice } = local;
      if (Array.isArray(malWords)) {
        TheMalWords = malWords.join("\n");
      }
      if (Array.isArray(blocked)) {
        alreadyBlocked = blocked;
      }
      shortURLsBol = shortURLs;
      longURLsBol = longURLs;
      malWordURLsBol = malWordURLs;
      malWordTextBol = malWordText;
      shouldOpenUserChoice = openUserChoice;
    })}
  }
);


chrome.tabs.onUpdated.addListener(function() {
    // Send a message to content.js to fetch all the top domains
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var activeTab = tabs[0];
      chrome.tabs.sendMessage(activeTab.id, {"message": "fetch_URLS"});
    });

    // Add a listener to handle the response from content.js
    chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // wait for a message from the content script
      if( request.message === "urls_fetched" ) {
        // run over all urls found
        var dirty_URLs = []
        chrome.storage.local.set({ dirty_URLs });
        dirty_URLs = falgging(request.data);
        chrome.storage.local.set({ dirty_URLs });
        if (dirty_URLs.length !==0 && shouldOpenTiming && shouldOpenUserChoice){
          shouldOpenTiming = false;
          chrome.windows.create({ 
            url: chrome.runtime.getURL("questionBox.html"), type: "popup", height: 450, width:600
          });
        }
      }
    });
});

// deal with all flagging option in the extension
function falgging(dataInfo){
  dirty_URLs = [];
  // run over all data and chceck if already in block list
  for ( var key in dataInfo ) {
    value = dataInfo[key]
    var isInList = false;
    for ( var key2 in alreadyBlocked ) {
      var alreadyBlockedUrl = alreadyBlocked[key2];
      if ((String(value).search(alreadyBlockedUrl)>-1) &&(String(value).length===alreadyBlockedUrl.length) ){
        isInList = true;
        break;
      }
    }
    if (isInList){
      continue;
    }
    // the url was not in the block list
    else{
      var added = false;
      // if short url is on, need to check if url length is less than 8 chars
      if (shortURLsBol){
        if (value.length < 8){
          dirty_URLs.push(value)
          added = true;
        }
      }
      // if long url is on, need to check if url length is more than 100 chars
      if (longURLsBol & !added){
        if (value.length > 100){
          dirty_URLs.push(value)
          added = true;
        }
      }
      // if suspicious words flag is on need to check if url contain one of the words
      if (malWordURLsBol && !added){
        var TheMalWord = String(TheMalWords)
        var indx = TheMalWord.search("\n")
        var theWord  = TheMalWord.substring(0,indx)
        // run over all suspicious words and check them
        while (indx > 1){
          var theWord  = TheMalWord.substring(0,indx)
          TheMalWord = TheMalWord.substring(indx+1,)
          var indx = TheMalWord.search("\n")
          if(theWord.length > 0){
            var indOfWord = value.search(theWord)
            if((indOfWord !== -1)&&!added ){
              dirty_URLs.push(value)
              added = true;
              break;
            }
          }
        }
        // search if suspicious word appear in url
        if(TheMalWord.length > 0){
          var indOfWord = value.search(TheMalWord)
          if((indOfWord !== -1)&&!added ){
            dirty_URLs.push(value)
            added = true;
          }
        }
      }
    }
  }
  // urls to be blocked
  return dirty_URLs;
}