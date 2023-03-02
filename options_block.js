// get data from HTML options page
const textarea_block = document.getElementById("textarea_block");
const save = document.getElementById("save");
const checkbox = document.getElementById("checkbox");


// add a listener to the moment the user click the button
save.addEventListener("click", () => {
  // all the urls in textarea need to be blocked
  const blocked = textarea_block.value.split("\n").map(s => s.trim()).filter(Boolean);
  chrome.storage.local.set({ blocked });
});

// add a listener to each change
checkbox.addEventListener("change", (event) => {
  const block = event.target.checked;
  // block site list has changed need to re-set it
  chrome.storage.local.set({ block });
});

// a new site to be blocked - the user cheese to block
window.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["blocked", "block"], function (local) {
    const { blocked, block } = local;
    if (Array.isArray(blocked)) {
      textarea_block.value = blocked.join("\n");
      checkbox.checked = block;
    }
  });
});