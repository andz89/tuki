import { create } from "zustand";

export const useExtractLinksStore = create((set, get) => ({
  allLinks: [],
  brokenLinks: [],
  error: "",
  tabId: null,
  requestTabId: null,

  setAllLinks: (links) => set({ allLinks: links }),
  addBrokenLink: (link) => set({ brokenLinks: [...get().brokenLinks, link] }),
  resetBrokenLinks: () => set({ brokenLinks: [] }),
  isBroken: (href) => get().brokenLinks.some((l) => l.href === href),
  setError: (msg) => set({ error: msg }),

  setTabId: (id) => set({ tabId: id }),
  setRequestTabId: (id) => set({ requestTabId: id }),
}));
