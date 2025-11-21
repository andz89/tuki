import { useEffect, useState } from "react";
import { useExtractLinksStore } from "../../store/useExtractLinksStore.jsx";

import { handleFindOnPage, fetchLinksFromTab } from "./linksListApi.js";
import { copyToClipboard } from "../../utils/clipboardUtils.js";
export function useLinksList() {
  const {
    allLinks,
    setAllLinks,
    requestTabId,
    error,
    tabId,
    setTabId,
    setRequestTabId,
  } = useExtractLinksStore();

  const [loading, setLoading] = useState(false);
  const [currentTabId, setCurrentTabId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedUniqueClass, setCopiedUniqueClass] = useState("");
  const [linkStatuses, setLinkStatuses] = useState({});

  const tabMismatch =
    requestTabId && currentTabId && requestTabId !== currentTabId;

  const updateCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) setCurrentTabId(tab.id);
  };

  const getLinks = async () => {
    setLinkStatuses({});
    setLoading(true);
    try {
      const links = await fetchLinksFromTab(setTabId, setRequestTabId);

      setAllLinks(links);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (hrefLink, uniqueClass) => {
    copyToClipboard(hrefLink);
    setCopied(true);
    setCopiedUniqueClass(uniqueClass);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    updateCurrentTab();

    const tabListener = (message) => {
      if (message.action === "tabChanged") {
        updateCurrentTab();
        setLoading(false);
      }
    };

    const statusListener = (message) => {
      if (message.type === "link-status") {
        setLinkStatuses((prev) => ({
          ...prev,
          [message.href]: message.status,
        }));
      }
    };

    chrome.runtime.onMessage.addListener(tabListener);
    chrome.runtime.onMessage.addListener(statusListener);

    return () => {
      chrome.runtime.onMessage.removeListener(tabListener);
      chrome.runtime.onMessage.removeListener(statusListener);
    };
  }, []);

  return {
    allLinks,
    error,
    loading,
    tabMismatch,
    copied,
    copiedUniqueClass,
    linkStatuses,
    handleCopy,
    handleFindOnPage,
    getLinks,
  };
}
