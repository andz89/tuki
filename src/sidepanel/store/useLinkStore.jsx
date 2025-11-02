import { create } from "zustand";

export const useLinkStore = create((set, get) => ({
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
        set({ error: "No active tab found." });
        return;
      }

      const activeTabId = tab.id;
      set({ tabId: activeTabId }); // ✅ store the tabId

      // // (optional) Inject content script each time
      // await chrome.scripting.executeScript({
      //   target: { tabId: activeTabId },
      //   files: ["content.js"],
      // });

      chrome.tabs.sendMessage(
        activeTabId,
        { type: "extract-links" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            set({ error: "Cannot access this page’s links." });
            return;
          }

          if (!response) {
            console.warn("No direct response from content script.");
            return;
          }

          if (response.data) {
            set({ allLinks: response.data, error: "" });
            console.log(
              `✅ Links fetched from tab ${activeTabId}:`,
              response.data
            );
          }
        }
      );
    } catch (err) {
      console.error("Link fetch error:", err);
      set({ error: "Error fetching links." });
    }
  },
}));
