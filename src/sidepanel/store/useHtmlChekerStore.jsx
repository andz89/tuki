import { create } from "zustand";

export const useHtmlChecker = create((set) => ({
  results: [],
  error: null,
  loading: false,

  setResults: (results) => set({ results }),
  setError: (error) => set({ error }),
  setLoading: (loading) => set({ loading }),

  reset: () => set({ results: [], error: null, loading: false }),
}));
