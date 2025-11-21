chrome.action.onClicked.addListener(async (tab) => {
  // When the extension icon is clicked, open the side panel
  await chrome.sidePanel.open({ tabId: tab.id });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    try {
      chrome.tabs.sendMessage(tabId, { type: "ping" }, async (response) => {
        if (chrome.runtime.lastError || !response) {
          // "Injecting content.js into reloaded tab."
          try {
            await chrome.scripting.executeScript({
              target: { tabId },
              files: ["content.js"],
            });
          } catch (e) {
            console.log("Cannot inject into tab:", e.message);
            return;
          }
        } else {
          console.log("content.js already active on this tab.");
        }

        chrome.runtime.sendMessage({ action: "tabReload" });
      });
    } catch (e) {
      console.log("Tab update error:", e.message);
    }
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
          console.log("Cannot inject into tab:", e.message);
          return;
        }
      } else {
        console.log("content.js already active on this tab.");
      }

      chrome.runtime.sendMessage({ action: "tabChanged", tabId });
    });
  } catch (e) {
    console.log("Tab activation error:", e.message);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "tabChanged") {
    console.log("Tab changed:", message.tabId);
  }
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

  if (message.type === "check_image_url") {
    fetch(message.url, { method: "HEAD" })
      .then((res) => {
        sendResponse({
          url: message.url,
          ok: res.ok,
          status: res.status,
          contentType: res.headers.get("content-type") || null,
        });
      })
      .catch(() => {
        sendResponse({
          url: message.url,
          ok: false,
          status: "NETWORK_ERROR",
        });
      });

    return true;
  }
  if (message.type === "check_links_head") {
    const links = message.links;

    Promise.all(
      links.map(async (data) => {
        if (data.href.startsWith("mailto:")) {
          return { ...data, ok: true, status: 200 };
        }

        try {
          const response = await fetch(data.href, { method: "HEAD" });
          return {
            ...data,
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
          };
        } catch (err) {
          return {
            ...data,
            ok: false,
            status: "NETWORK_ERROR",
          };
        }
      })
    ).then((results) => {
      sendResponse({ results });
    });

    return true;
  }
});
