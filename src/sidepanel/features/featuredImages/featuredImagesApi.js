export async function fetchFeaturedImages() {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) throw new Error("No active tab");

    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "featuredImages" },
        (response) => {
          if (chrome.runtime.lastError) {
            return reject(new Error(chrome.runtime.lastError.message));
          }
          resolve(response?.data || []);
        }
      );
    });
  } catch (error) {
    throw error;
  }
}
