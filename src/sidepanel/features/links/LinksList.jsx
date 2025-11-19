import { useEffect, useState } from "react";
import { useExtractLinksStore } from "../../store/useExtractLinksStore.jsx";
import { useHelperFunctionStore } from "../../store/useHelperFunctionStore.jsx";
import { AlertBoxElement } from "../../components/UI/Notification.jsx";
import LinksListTemplate from "../../components/templates/LinksList_template.jsx";

export default function LinksPanel() {
  const {
    allLinks,
    setAllLinks,
    requestTabId,
    error,
    tabId,
    fetchLinks,
    setRequestTabId,
  } = useExtractLinksStore();

  const { copyToClipboard, handleFindOnPage } = useHelperFunctionStore();

  const [copied, setCopied] = useState(false);
  const [copiedUniqueClass, setCopiedUniqueClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentTabId, setCurrentTabId] = useState(null);
  const [linkStatuses, setLinkStatuses] = useState({});

  const tabMismatch = tabId && currentTabId && tabId !== currentTabId;

  const updateCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) setCurrentTabId(tab.id);
  };

  const handleCopy = (href, uniqueClass) => {
    copyToClipboard(href);
    setCopied(true);
    setCopiedUniqueClass(uniqueClass);
    setTimeout(() => setCopied(false), 1500);
  };

  const onExtractLinks = async () => {
    setLinkStatuses({});
    setLoading(true);

    try {
      const links = await fetchLinks();
      setAllLinks(links);
      setRequestTabId(tabId);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateCurrentTab();

    const handleTabChange = (msg) => {
      if (msg.action === "tabChanged") {
        updateCurrentTab();
        setLoading(false);
      }
    };

    const handleStatusMessage = (msg) => {
      if (msg.type === "link-status") {
        setLinkStatuses((prev) => ({
          ...prev,
          [msg.href]: msg.status,
        }));
      }
    };

    chrome.runtime.onMessage.addListener(handleTabChange);
    chrome.runtime.onMessage.addListener(handleStatusMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleTabChange);
      chrome.runtime.onMessage.removeListener(handleStatusMessage);
    };
  }, []);

  return (
    <div className="p-3">
      {/* Extract button */}
      <div className="flex gap-2 mb-4 flex-col mx-2">
        <span
          className="text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium no-highlight cursor-pointer"
          onClick={onExtractLinks}
        >
          Extract Links
        </span>
      </div>

      {/* Tab mismatch warning */}
      {tabMismatch && (
        <AlertBoxElement
          message={
            <>
              <span className="font-medium">Warning:</span> ⚠️ You switched tabs
              — results belong to previous tab.
            </>
          }
          type="warning"
        />
      )}

      {/* Store error */}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {/* Loading */}
      {loading ? (
        <p className="text-sm text-gray-500 no-highlight">Loading links...</p>
      ) : (
        <LinksListTemplate
          links={allLinks}
          copied={copied}
          copiedUniqueClass={copiedUniqueClass}
          linkStatuses={linkStatuses}
          tabMismatch={tabMismatch}
          onFind={handleFindOnPage}
          onCopy={handleCopy}
        />
      )}
    </div>
  );
}
