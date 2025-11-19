import { create } from "zustand";

export const useBrokenLinksStore = create((set, get) => ({
  allLinks: [],
  brokenLinks: [],
  error: "",
  tabId: null, // ✅ initialize with null
  requestTabId: null,

  // setters
  setAllLinks: (links) => set({ allLinks: links }),
  addBrokenLink: (link) => set({ brokenLinks: [...get().brokenLinks, link] }),
  resetBrokenLinks: () => set({ brokenLinks: [] }),
  isBroken: (href) => get().brokenLinks.some((l) => l.href === href),
  setError: (msg) => set({ error: msg }),

  setTabId: (id) => set({ tabId: id }), // ✅ handy setter for tabId
  setRequestTabId: (id) => set({ requestTabId: id }),
  // main fetch function
  fetchLinks: async () => {
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

      // // Optional: store tabId if needed
      // set({ tabId: activeTabId });
      // set({ requestTabId: activeTabId });

      // Wrap sendMessage in a promise to return data
      const links = await new Promise((resolve, reject) => {
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
              console.warn("No direct response from content script.");
              resolve([]);
              return;
            }

            if (response.data) {
              console.log(
                `✅ Links fetched from tab ${activeTabId}:`,
                response.data
              );

              resolve(response.data);
            } else {
              resolve([]);
            }
          }
        );
      });

      return links; // ✅ return the fetched links
    } catch (err) {
      console.error("Link fetch error:", err);
      return [];
    }
  },
}));
