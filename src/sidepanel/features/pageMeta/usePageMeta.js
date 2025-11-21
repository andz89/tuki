import { useState, useEffect } from "react";
import { getPageInfo } from "./pageMetaApi";

export default function usePageDetails() {
  const [pageInfo, setPageInfo] = useState({
    title: "",
    description: "",
    lang: "",
    canonical: "",
    error: "",
  });

  async function fetchPageDetails() {
    try {
      const data = await getPageInfo();
      setPageInfo({ ...data, error: "" });
    } catch (err) {
      setPageInfo((prev) => ({
        ...prev,
        error: "Error fetching page details.",
      }));
    }
  }

  useEffect(() => {
    fetchPageDetails();

    const listener = (msg) => {
      if (msg.action === "tabChanged") fetchPageDetails();
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return { pageInfo };
}
