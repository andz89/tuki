export async function startHovering(currentTabId) {
  try {
    chrome.tabs.sendMessage(
      currentTabId,
      { type: "startInspecting" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.log("Failed to start:", chrome.runtime.lastError);
        } else {
          console.log("Inspecting started:", response?.data);
        }
      }
    );
  } catch (err) {
    console.log("Error starting hover:", err);
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
