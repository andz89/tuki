import { useState, useEffect } from "react";
import { useBrokenLinksStore } from "../../store/useBrokenLinksStore.jsx";
import {
  fetchLinksFromTab,
  handleFindOnPage,
  checkLinksInBackground,
} from "./brokenLinksListApi.js";
import { copyToClipboard } from "../../utils/clipboardUtils.js";
export function useBrokenLinks() {
  const {
    brokenLinks,
    setTabId,
    addBrokenLink,
    resetBrokenLinks,
    setRequestTabId,
    requestTabId,
  } = useBrokenLinksStore();

  const [loading, setLoading] = useState(false);
  const [currentTabId, setCurrentTabId] = useState(null);
  const [linkStatuses, setLinkStatuses] = useState({});
  const [copiedUniqueClass, setCopiedUniqueClass] = useState("");
  const [copied, setCopied] = useState(false);

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

  const tabMismatch =
    requestTabId && currentTabId && requestTabId !== currentTabId;

  const getLinks = async () => {
    updateCurrentTab();

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    setRequestTabId(tab.id);
    setLoading(true);
    resetBrokenLinks();

    try {
      const linksFromTab = await fetchLinksFromTab(setTabId, setRequestTabId);

      const results = await checkLinksInBackground(linksFromTab);

      processBrokenLinks(results.results);
    } finally {
      setLoading(false);
    }
  };
  const processBrokenLinks = (results = []) => {
    resetBrokenLinks();

    results.forEach((item) => {
      if (!item.ok) {
        addBrokenLink({
          href: item.href,
          uniqueClass: item.uniqueClass,
          status: item.status,
          statusText: item.statusText,
        });
      }
    });
  };

  useEffect(() => {
    updateCurrentTab();

    const handleMessageLinkStatus = (message) => {
      if (message.type === "link-status") {
        setLinkStatuses((prev) => ({
          ...prev,
          [message.href]: message.status,
        }));
      }
    };

    const handleTabChange = (message) => {
      if (message.action === "tabChanged") updateCurrentTab();
    };

    chrome.runtime.onMessage.addListener(handleMessageLinkStatus);
    chrome.runtime.onMessage.addListener(handleTabChange);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessageLinkStatus);
      chrome.runtime.onMessage.removeListener(handleTabChange);
    };
  }, []);

  return {
    brokenLinks,
    loading,
    handleCopy,
    requestTabId,
    getLinks,
    linkStatuses,
    copiedUniqueClass,
    tabMismatch,
    copied,
    handleFindOnPage,
  };
}
