import { useState, useEffect } from "react";
import { startHovering } from "./LinkInspectorListApi.js";
export function usePageLinksInspector() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTabId, setCurrentTabId] = useState(null);
  const [requestTabId, setRequestTabId] = useState(null);
  const [linkStatuses, setLinkStatuses] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const updateCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) setCurrentTabId(tab.id);
  };

  const startHoveringButton = async () => {
    setLinks([]);
    setLoading(true);
    setIsFetching(true);
    await updateCurrentTab();
    setRequestTabId(currentTabId);
    await startHovering(currentTabId);
    // try {
    //   chrome.tabs.sendMessage(
    //     currentTabId,
    //     { type: "startHovering" },
    //     (response) => {
    //       if (chrome.runtime.lastError) {
    //         console.warn("Failed to start hovering:", chrome.runtime.lastError);
    //       } else {
    //         console.log("Hovering started:", response?.data);
    //       }
    //     }
    //   );
    // } catch (err) {
    //   console.error("Error starting hover:", err);
    // }
  };

  const stopHovering = () => {
    if (!requestTabId) return;
    setIsFetching(false);
    chrome.tabs.sendMessage(requestTabId, { type: "stopHoveringLink" });
    setLoading(false);
  };

  useEffect(() => {
    updateCurrentTab();

    const handleMessage = (message) => {
      if (message.type === "LINKS_FOUND") {
        const normalize = (url) => url.toLowerCase().replace(/\/$/, "");
        const seen = new Set();
        const uniqueLinks = [];

        message.links.forEach((link) => {
          const normalized = normalize(link.href);
          if (!seen.has(normalized)) {
            seen.add(normalized);
            uniqueLinks.push(link);
          }
        });

        setLinks(uniqueLinks);
      } else if (message.type === "link-status") {
        setLinkStatuses((prev) => ({
          ...prev,
          [message.href]: message.status,
        }));
      }
    };

    const handleTabChange = (message) => {
      if (message.action === "tabChanged") {
        setIsFetching(false);
        stopHovering();
        updateCurrentTab();
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    chrome.runtime.onMessage.addListener(handleTabChange);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
      chrome.runtime.onMessage.removeListener(handleTabChange);
    };
  }, []);

  return {
    links,
    linkStatuses,
    loading,
    requestTabId,
    currentTabId,
    startHoveringButton,
    stopHovering,
    isFetching,
  };
}
