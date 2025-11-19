import { useState, useEffect } from "react";
import { useBrokenLinksStore } from "../../store/useBrokenLinksStore.jsx";
import { fetchLinksFromTab, handleFindOnPage } from "./brokenLinksListApi.js";
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

  const processBrokenLinks = async (links = links) => {
    setLoading(true);
    resetBrokenLinks(); // clear previous broken links

    // check each link
    const fetchPromises = links.map((data) => {
      if (data.href.startsWith("mailto:")) return Promise.resolve();

      return fetch(data.href, { method: "HEAD" })
        .then((response) => {
          if (!response.ok) {
            addBrokenLink({ href: data.href, uniqueClass: data.uniqueClass });
          }
        })
        .catch(() => {
          addBrokenLink({ href: data.href, uniqueClass: data.uniqueClass });
        });
    });

    await Promise.all(fetchPromises);

    setLoading(false);
  };
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
      const links = await fetchLinksFromTab(setTabId, setRequestTabId);
      processBrokenLinks(links);
    } finally {
    }
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
