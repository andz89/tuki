// src/hooks/useScanImages.js
import { useState } from "react";
import { useScanImagesStore } from "../../store/useScanImagesStore.jsx";
import { scanAllImages } from "./scanImagesApi.js";

export const useScanImages = () => {
  const [loading, setLoading] = useState(false);
  const setResults = useScanImagesStore((s) => s.setResults);

  const scanImages = async () => {
    setLoading(true);
    setResults([]);
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const results = await scanAllImages(tab.id);
      setResults(results);
    } catch (err) {
      console.error("Error scanning images:", err);
    }
    setLoading(false);
  };

  return { loading, scanImages };
};
