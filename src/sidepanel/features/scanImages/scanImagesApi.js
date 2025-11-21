export const extractImages = async (tabId) => {
  const response = await chrome.tabs.sendMessage(tabId, {
    type: "extract_images",
  });
  return response.images;
};

export const checkImageUrl = async (url) => {
  const result = await chrome.runtime.sendMessage({
    type: "check_image_url",
    url,
  });
  return result; // should include { url, ok, status }
};

export const scanAllImages = async (tabId) => {
  const images = await extractImages(tabId);
  const results = await Promise.all(images.map(checkImageUrl));
  return results;
};
