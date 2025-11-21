export async function fetchLinksFromTab(setTabId, setRequestTabId) {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      return [];
    }

    const activeTabId = tab.id;

    setTabId(activeTabId);
    setRequestTabId(activeTabId);

    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        activeTabId,
        { type: "extract-links" },
        (response) => {
          if (chrome.runtime.lastError) {
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
    console.log("error:", err);
    return [];
  }
}
export const handleFindOnPage = async (uniqueClass) => {
  await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]?.id) return;
    chrome.tabs.sendMessage(tabs[0].id, {
      type: "locateLinkOnPage",
      targetHref: uniqueClass,
    });
  });
};
export const checkLinksInBackground = async (links) => {
  return await chrome.runtime.sendMessage({
    type: "check_links_head",
    links,
  });
};
