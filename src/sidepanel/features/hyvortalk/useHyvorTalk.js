import { useState, useEffect } from "react";
import { getHyvorTalkApi } from "./hyvorTalkApi";

export default function useHyvorTalk() {
  const [hyvorTag, setHyvorTag] = useState(null);
  const [error, setError] = useState("");

  const fetchHyvorTag = async () => {
    try {
      const data = await getHyvorTalkApi();
      if (!data || data.length === 0) {
        setHyvorTag(null);
      } else {
        setHyvorTag(data[0]);
      }
    } catch (err) {
      console.log("Fetch error:", err);
      setError("Oops! Something went wrong. Please refresh the page.");
    }
  };

  useEffect(() => {
    fetchHyvorTag();

    const listener = (message) => {
      if (message.action === "tabChanged") fetchHyvorTag();
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return { hyvorTag, error };
}
