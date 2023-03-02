// get data from HTML options page
const malWordsList = document.getElementById("malWords");
const malSave = document.getElementById("malSave");
const shortURLsClick = document.getElementById("shortURLs");
const longURLsClick = document.getElementById("longURLs");
const malWordURLsClick = document.getElementById("malWordURLs");
const FlagActiveation = document.getElementById("FlagActive");

// list of all bad URL's to block
chrome.storage.local.get(["dirty_URLs"], function (local) {
  const {dirty_URLs} = local;
})

// add a listener to the moment the user click the button
malSave.addEventListener("click", () => {
  // list of bad words the userinserted
  const malWords = malWordsList.value.split("\n").map(s => s.trim()).filter(Boolean);
  chrome.storage.local.set({ malWords });
  chrome.runtime.sendMessage( {"message": "info_updated"});
});

// add a listener to each change
FlagActiveation.addEventListener("change", (event) => {
  // chnaged button selection for falgging
  const openUserChoice = event.target.checked;
  chrome.storage.local.set({ openUserChoice });
  chrome.runtime.sendMessage( {"message": "info_updated"});
});


shortURLsClick.addEventListener("change", (event) => {
  // changed user choice for short URL flag
  const shortURLs = event.target.checked;
  chrome.storage.local.set({ shortURLs });
  chrome.runtime.sendMessage( {"message": "info_updated"});
  console.log(shortURLs)
});

longURLsClick.addEventListener("change", (event) => {
  // changed user choice for long URL flag
  const longURLs = event.target.checked;
  chrome.storage.local.set({ longURLs });
  chrome.runtime.sendMessage( {"message": "info_updated"});
  console.log(longURLs)

});

malWordURLsClick.addEventListener("change", (event) => {
  // changed user choice for suspicious words flag
  const malWordURLs = event.target.checked;
  chrome.storage.local.set({ malWordURLs });
  chrome.runtime.sendMessage( {"message": "info_updated"});
});

//read from memory
window.addEventListener("DOMContentLoaded", () => {
  // chanck state of all flags
  chrome.storage.local.get(["malWords","shortURLs", "longURLs","malWordURLs", "malWordText","openUserChoice"], function (local) {
    // get all suspicious words
    const {malWords, shortURLs, longURLs, malWordURLs, malWordText ,openUserChoice} = local;
    if (Array.isArray(malWords)) {
      malWordsList.value = malWords.join("\n");
    }
    // read all flagging options
    shortURLsClick.checked = shortURLs;
    longURLsClick.checked = longURLs;
    malWordURLsClick.checked = malWordURLs;
    FlagActiveation.checked = openUserChoice ;
  });
});
