// src/api/linksListApi.js
export async function fetchLinksFromTab(setTabId, setRequestTabId) {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      console.warn("No active tab found.");
      return [];
    }

    const activeTabId = tab.id;

    // Optional: store tabId if needed
    setTabId(activeTabId);
    setRequestTabId(activeTabId);

    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        activeTabId,
        { type: "extract-links" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            reject(new Error("Cannot access this page’s links."));
            return;
          }

          if (!response) {
            resolve([]);
            return;
          }

          resolve(response.data || []);
        }
      );
    });
  } catch (err) {
    console.error("Link fetch error:", err);
    return [];
  }
}
