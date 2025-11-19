export async function startHovering(currentTabId) {
  try {
    chrome.tabs.sendMessage(
      currentTabId,
      { type: "startHovering" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn("Failed to start hovering:", chrome.runtime.lastError);
        } else {
          console.log("Hovering started:", response?.data);
        }
      }
    );
  } catch (err) {
    console.error("Error starting hover:", err);
  }
}
