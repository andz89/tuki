import { useState, useEffect } from "react";
import { fetchFeaturedImages } from "./featuredImagesApi.js";

export function useFeaturedImages() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  async function loadImages() {
    try {
      const result = await fetchFeaturedImages();
      setImages(result);
      setError("");
    } catch (err) {
      setError("Error fetching meta data.");
    }
  }

  useEffect(() => {
    loadImages();

    const listener = (message) => {
      if (message.action === "tabChanged") {
        loadImages();
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return { images, error };
}
