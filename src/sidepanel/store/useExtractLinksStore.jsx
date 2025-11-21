import { create } from "zustand";

export const useExtractLinksStore = create((set, get) => ({
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
}));
