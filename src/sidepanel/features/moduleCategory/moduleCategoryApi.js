export async function getCategoryElements() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tab.id,
      { type: "getCategoryElements" },
      (response) => {
        if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
        resolve(response?.data || []);
      }
    );
  });
}
