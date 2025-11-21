import { useState, useEffect } from "react";
import { getCategoryElements } from "./moduleCategoryApi";

export default function useModuleCategory() {
  const [elements, setElements] = useState([]);
  const [error, setError] = useState(null);

  const fetchElements = async () => {
    try {
      const data = await getCategoryElements();
      if (!data || data.length === 0) {
        setElements([]);
        setError(null);
      } else {
        setElements(data);
      }
    } catch (err) {
      console.log("Error fetching module categories:", err);
      setError("Cannot access this page's elements.");
    }
  };

  useEffect(() => {
    fetchElements();

    const listener = (message) => {
      if (message.action === "tabChanged") {
        fetchElements();
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return { elements, error };
}
