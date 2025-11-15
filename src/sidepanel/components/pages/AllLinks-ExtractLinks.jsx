import { use, useEffect, useState } from "react";
import { useExtractLinksStore } from "../../store/useExtractLinksStore";
// import AlertBox from "../helper/notification";
import { useHelperFunctionStore } from "../../store/useHelperFunctionStore";
import {
  CopyNotificationElement,
  AlertBoxElement,
} from "../helper/Notification.jsx";

export default function LinksPanel() {
  // const [links, setLinks] = useState([]);

  // 🔹 Fetch all links from the current active tab

  const {
    allLinks,
    setAllLinks,
    requestTabId,
    error,
    tabId,
    fetchLinks,
    setRequestTabId,
  } = useExtractLinksStore();
  const [copiedUniqueClass, setCopiedUniqueClass] = useState("");
  const { copyToClipboard, handleFindOnPage } = useHelperFunctionStore();
  const [copied, setCopied] = useState(false);
  const handleCopy = (hrefLink, uniqueClass) => {
    copyToClipboard(hrefLink);
    setCopied(true);
    setCopiedUniqueClass(uniqueClass);
    // Hide message after 1.5 seconds
    setTimeout(() => setCopied(false), 1500);
  };

  // ************************* get current tab id on load & tab switch *****************************//
  const [loading, setLoading] = useState(false);
  const [currentTabId, setCurrentTabId] = useState(null); // ✅ track active tab id
  const [linkStatuses, setLinkStatuses] = useState({}); // store status per uniqueClass

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
      const links = await fetchLinks(); // returns actual data
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
    // Re-fetch when tab changes
    const listener = (message) => {
      if (message.action === "tabChanged") {
        updateCurrentTab();
        setLoading(false); // reset loading
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    // Listener for messages from content.js
    const handleMessage = (message, sender, sendResponse) => {
      if (message.type === "link-status") {
        setLinkStatuses((prev) => ({
          ...prev,
          [message.href]: message.status,
        }));
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <div className="p-3">
      <div className="flex gap-2 mb-4 flex-col mx-2">
        <span
          className="text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium no-highlight cursor-pointer"
          onClick={async () => {
            await getLinks();
          }}
        >
          Extract Links
        </span>
      </div>
      {tabMismatch && (
        <AlertBoxElement
          message={
            <>
              <span className="font-medium">Warning alert!</span> ⚠️ Looks like
              you switched tabs! The links below are from your previous tab.
            </>
          }
          type="warning"
        />
      )}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      {!loading && requestTabId && allLinks.length === 0 && (
        <p className="text-sm text-gray-500 mb-2">No broken links found.</p>
      )}
      {loading === true ? (
        <p className="text-sm text-gray-500 no-highlight">Loading links...</p>
      ) : (
        <ol className="list-decimal ml-4 space-y-3">
          {allLinks.map((link, i) => (
            <li key={link.uniqueClass} id={`link-${i}`} className="mb-3">
              <div className="flex justify-left items-center mb-2 gap-2">
                <button
                  onClick={() => handleFindOnPage(link.uniqueClass)}
                  data-link={link.uniqueClass}
                  disabled={tabMismatch} // disable if tab changed
                  className={`rounded border border-yellow-700 text-xs font-semibold py-1 px-2 ${
                    tabMismatch
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-slate-700 hover:bg-slate-200 cursor-pointer"
                  }`}
                >
                  Find on the page
                </button>

                <button
                  onClick={() => handleCopy(link.href, link.uniqueClass)}
                  className="rounded border border-yellow-700 text-xs font-semibold hover:bg-slate-200 py-1 px-2 text-slate-700 cursor-pointer no-highlight"
                >
                  Copy link
                  {copiedUniqueClass === link.uniqueClass && copied && (
                    <CopyNotificationElement />
                  )}
                </button>
              </div>

              <div>
                {linkStatuses[link.uniqueClass] === "hidden" && (
                  <AlertBoxElement
                    message={` This link is hidden on the page and cannot be displayed. Link ID: 
                    ${link.uniqueClass}`}
                    type="warning"
                  />
                )}

                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-none text-base break-words text-slate-600 hover:text-yellow-600"
                >
                  {link.href}
                </a>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
