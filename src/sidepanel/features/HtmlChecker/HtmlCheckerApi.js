export const checkHtmlApi = async (tabUrl) => {
  return await chrome.runtime.sendMessage({
    type: "FETCH_PAGE_HTML",
    url: tabUrl,
  });
};
