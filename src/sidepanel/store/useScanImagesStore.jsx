import { create } from "zustand";

export const useScanImagesStore = create((set) => ({
  results: [],
  brokenCount: 0,

  setResults: (newResults) =>
    set(() => ({
      results: newResults,
      brokenCount: newResults.filter((r) => !r.ok).length,
    })),

  clearResults: () =>
    set(() => ({
      results: [],
      brokenCount: 0,
    })),
}));
