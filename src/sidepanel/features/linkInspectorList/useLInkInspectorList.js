import { useState, useEffect } from "react";
import { startHovering, handleFindOnPage } from "./LinkInspectorListApi.js";

import { copyToClipboard } from "../../utils/clipboardUtils.js";
export function usePageLinksInspector() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentTabId, setCurrentTabId] = useState(null);
  const [requestTabId, setRequestTabId] = useState(null);
  const [linkStatuses, setLinkStatuses] = useState({});
  const [isFetching, setIsFetching] = useState(false);

  const [copiedUniqueClass, setCopiedUniqueClass] = useState("");
  const [copied, setCopied] = useState(false);

  const tabMismatch =
    requestTabId && currentTabId && requestTabId !== currentTabId;

  const handleCopy = (hrefLink, uniqueClass) => {
    copyToClipboard(hrefLink);
    setCopied(true);
    setCopiedUniqueClass(uniqueClass);
    setTimeout(() => setCopied(false), 1500);
  };

  const updateCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) setCurrentTabId(tab.id);
  };

  const handleStartHovering = async () => {
    setLinks([]);
    setLoading(true);
    setIsFetching(true);
    await updateCurrentTab();
    setRequestTabId(currentTabId);
    await startHovering(currentTabId);
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
    isFetching,
    links,
    linkStatuses,
    loading,
    requestTabId,
    currentTabId,
    copied,
    copiedUniqueClass,
    tabMismatch,
    handleCopy,
    handleStartHovering,
    stopHovering,
    handleFindOnPage,
    copyToClipboard,
  };
}
