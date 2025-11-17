//config background script to open side panel on extension icon click

chrome.action.onClicked.addListener(async (tab) => {
  // When the extension icon is clicked, open the side panel
  await chrome.sidePanel.open({ tabId: tab.id });
});
// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "tabChanged") {
    console.log("Tab changed:", message.tabId);
  }
});
chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    chrome.tabs.sendMessage(tabId, { type: "ping" }, async (response) => {
      if (chrome.runtime.lastError || !response) {
        console.log("Injecting content.js into new tab...");

        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            files: ["content.js"],
          });
        } catch (e) {
          console.warn("Cannot inject into tab:", e.message);
          return; // Stop here if inject failed
        }
      } else {
        console.log("content.js already active on this tab.");
      }

      chrome.runtime.sendMessage({ action: "tabChanged", tabId });
    });
  } catch (e) {
    console.warn("Tab activation error:", e.message);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    try {
      chrome.tabs.sendMessage(tabId, { type: "ping" }, async (response) => {
        if (chrome.runtime.lastError || !response) {
          console.log("Injecting content.js into reloaded tab...");
          try {
            await chrome.scripting.executeScript({
              target: { tabId },
              files: ["content.js"],
            });
          } catch (e) {
            console.warn("Cannot inject into tab:", e.message);
            return;
          }
        } else {
          console.log("✅ content.js already active on this tab.");
        }

        chrome.runtime.sendMessage({ action: "tabReload" });
      });
    } catch (e) {
      console.warn("Tab update error:", e.message);
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "FETCH_PAGE_HTML" && message.url) {
    (async () => {
      try {
        const res = await fetch(message.url, { credentials: "omit" });
        if (!res.ok) {
          sendResponse({
            ok: false,
            status: res.status,
            statusText: res.statusText,
          });
          return;
        }
        const html = await res.text();
        sendResponse({ ok: true, html });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();

    return true;
  }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "EXTRACT_PAGE_INFO" && message.url) {
    (async () => {
      try {
        const res = await fetch(message.url, { credentials: "omit" });
        if (!res.ok) {
          sendResponse({
            ok: false,
            status: res.status,
            statusText: res.statusText,
          });
          return;
        }

        const html = await res.text();

        // Send the raw HTML to the content script for parsing
        // Use chrome.tabs.sendMessage if you want it parsed in the active tab
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        chrome.tabs.sendMessage(tab.id, { type: "PARSE_HTML", html });

        // Optional: also respond to the sender that fetch succeeded
        sendResponse({ ok: true, message: "HTML sent to content script" });
      } catch (err) {
        sendResponse({ ok: false, error: err.message });
      }
    })();

    return true; // keep messaging channel open
  }
});
