// useExtractLinkStore.jsx
import { create } from "zustand";

export const useHelperFunctionStore = create((set) => ({
  copyToClipboard: (text) => {
    if (!navigator.clipboard) {
      console.warn("Clipboard API not supported");
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      console.log(`Copied to clipboard: ${text}`);
    });
  },

  // Store handleFindOnPage function
  handleFindOnPage: (uniqueClass) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "window-displayLink",
        targetHref: uniqueClass,
      });
    });
  },
}));
