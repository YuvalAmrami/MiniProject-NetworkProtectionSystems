// Get the modal
var modal = document.getElementById("myModal");
// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];
// Get the checkbox element 
const stopFlagg = document.getElementById("stopFlagging");
// Get the block button element
const blockBotn = document.getElementById("block");
// Get textarea of URL's element
const URLsTableEle = document.getElementById("URLsTable");


window.addEventListener("DOMContentLoaded", () => {
  // get list of bad urls from list
  chrome.storage.local.get(["dirty_URLs"], function (local) {
    const {dirty_URLs } = local;
    if (Array.isArray(dirty_URLs)) {
      URLsTableEle.value = dirty_URLs.join("\n");
    }
  });
});


stopFlagg.addEventListener("change", (event) => {
  // set a new site to be blocked
  const openUserChoice = event.target.checked;
  chrome.storage.local.set({ openUserChoice });
  chrome.runtime.sendMessage( {"message": "info_updated"});
});


blockBotn.addEventListener("click", () => {
  // if user choose to block site suggestion add its URL to the list
  var UrlToBlock = URLsTableEle.value.split("\n").map(s => s.trim()).filter(Boolean);
  chrome.storage.local.get(["blocked"], function (local) {
    var {blocked} = local;
    if (Array.isArray(blocked)) {
      blocked = blocked.concat(UrlToBlock);
      chrome.storage.local.set({blocked})
      chrome.runtime.sendMessage( {"message": "info_updated"});
    }
  })
});
