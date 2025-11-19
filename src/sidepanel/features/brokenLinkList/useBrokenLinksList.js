import { useState, useEffect } from "react";
import { useBrokenLinksStore } from "../../store/useBrokenLinksStore.jsx";
import { fetchAndCheckLinks } from "./brokenLinksListApi.js";

export function useBrokenLinks() {
  const {
    brokenLinks,
    addBrokenLink,
    resetBrokenLinks,
    fetchLinks,
    setRequestTabId,
    requestTabId,
  } = useBrokenLinksStore();

  const [loading, setLoading] = useState(false);
  const [currentTabId, setCurrentTabId] = useState(null);
  const [linkStatuses, setLinkStatuses] = useState({});

  const updateCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) setCurrentTabId(tab.id);
  };
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
      const links = await fetchLinks();
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

    requestTabId,
    getLinks,
    linkStatuses,

    currentTabId,
  };
}
