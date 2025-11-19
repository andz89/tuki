// src/hooks/useLinksList.js
import { useEffect, useState } from "react";
import { useExtractLinksStore } from "../../store/useExtractLinksStore.jsx";
import { useHelperFunctionStore } from "../../store/useHelperFunctionStore.jsx";
import { fetchLinksFromTab } from "./linksListApi.js";

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

  const { copyToClipboard, handleFindOnPage } = useHelperFunctionStore();

  const [loading, setLoading] = useState(false);
  const [currentTabId, setCurrentTabId] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedUniqueClass, setCopiedUniqueClass] = useState("");
  const [linkStatuses, setLinkStatuses] = useState({});

  const tabMismatch = tabId && currentTabId && tabId !== currentTabId;

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
      console.error(err);
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
    requestTabId,
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
