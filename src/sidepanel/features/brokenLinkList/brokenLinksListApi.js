export async function fetchAndCheckLinks() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return [];

    const tabId = tab.id;

    return await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tabId,
        { type: "extract-links" },
        async (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            reject(new Error("Cannot access this page’s links."));
            return;
          }

          if (!response?.data) resolve([]);
          else {
            const links = await Promise.all(
              response.data.map(async (link) => {
                if (link.href.startsWith("mailto:"))
                  return { ...link, isBroken: false };
                try {
                  const res = await fetch(link.href, { method: "HEAD" });
                  return { ...link, isBroken: !res.ok };
                } catch {
                  return { ...link, isBroken: true };
                }
              })
            );
            resolve(links);
          }
        }
      );
    });
  } catch (err) {
    console.error("fetchAndCheckLinks error:", err);
    return [];
  }
}
