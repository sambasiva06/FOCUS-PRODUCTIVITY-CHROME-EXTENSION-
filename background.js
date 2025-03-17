let blockedSites = [
  "instagram.com", "facebook.com", "twitter.com", "tiktok.com",
  "snapchat.com", "reddit.com", "pinterest.com", "threads.net",
  "netflix.com", "hulu.com", "primevideo.com", "disneyplus.com", "hotstar.com",
  "twitch.tv", "vimeo.com",
  "buzzfeed.com", "cnn.com", "foxnews.com", "nytimes.com", "bbc.com",
  "theguardian.com", "usatoday.com", "forbes.com",
  "amazon.com", "flipkart.com", "ebay.com", "aliexpress.com", "bestbuy.com",
  "walmart.com", "target.com", "myntra.com",
  "roblox.com", "epicgames.com", "store.steampowered.com", "xbox.com",
  "playstation.com", "nintendo.com", "addictinggames.com"
];

function updateBlockingRules(enableBlocking) {
  let rules = blockedSites.map((site, index) => ({
    id: index + 1,
    priority: 1,
    action: enableBlocking
      ? { type: "block" }
      : { type: "allow" },
    condition: { urlFilter: `*://*.${site}/*`, resourceTypes: ["main_frame"] }
  }));

  let youtubeRule = {
    id: blockedSites.length + 1,
    priority: 1,
    action: enableBlocking
      ? { type: "block" }
      : { type: "allow" },
    condition: { regexFilter: "^https?:\\/\\/(.*\\.)?youtube\\.com\\/.*", resourceTypes: ["main_frame"] }
  };

  if (enableBlocking) {
    rules.push(youtubeRule);
  }

  chrome.declarativeNetRequest.updateDynamicRules(
    {
      removeRuleIds: [...blockedSites.map((_, index) => index + 1), blockedSites.length + 1],
      addRules: enableBlocking ? rules : []
    },
    () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      }
    }
  );
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.command === "startBlocking") {
    let duration = message.minutes * 60 * 1000;
    updateBlockingRules(true);
    chrome.alarms.create("stopBlocking", { when: Date.now() + duration });
    sendResponse({ success: true });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "stopBlocking") {
    updateBlockingRules(false);
  }
  if (chrome.extension.inIncognitoContext) {
    console.log("extension running in incognito");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs.executeScript(tabs[0].id, {
          code: 'alert("Website blocking may not function correctly in Incognito mode.");'
        });
      }
    });
  }
  // Function to check if a tab is in incognito mode
function checkIncognito(tab) {
  chrome.windows.get(tab.windowId, (window) => {
      if (window.incognito) {
          console.warn("Incognito mode detected. Extension will not work.");
          alert("Incognito mode is not allowed. Please use a normal window.");
          
          // Close the incognito tab
          chrome.tabs.remove(tab.id);
      }
  });
}

// Listen for new tabs being opened
chrome.tabs.onCreated.addListener(checkIncognito);

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "loading") {
      checkIncognito(tab);
  }
});

});