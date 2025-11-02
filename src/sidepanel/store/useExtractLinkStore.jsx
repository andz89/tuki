// useExtractLinkStore.jsx
import { create } from "zustand";

export const useExtractLinkStore = create((set) => ({
  links: [],
  requestTabId: null,
  error: null,

  setLinks: (links) => set({ links }),
  addLink: (link) => set((state) => ({ links: [...state.links, link] })),
  setRequestTabId: (id) => set({ requestTabId: id }),
  setError: (error) => set({ error }),
  resetLinks: () => set({ links: [] }),
}));
