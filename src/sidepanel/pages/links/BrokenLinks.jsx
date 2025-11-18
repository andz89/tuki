import { use, useEffect, useState } from "react";
import { useBrokenLinksStore } from "../../store/useBrokenLinksStore.jsx";

import { useHelperFunctionStore } from "../../store/useHelperFunctionStore.jsx";
import {
  CopyNotificationElement,
  AlertBoxElement,
} from "../../components/UI/Notification.jsx";
export default function BrokenLinksPanel() {
  const {
    brokenLinks,
    addBrokenLink,
    resetBrokenLinks,
    tabId,
    fetchLinks,
    setRequestTabId,
    requestTabId,
  } = useBrokenLinksStore();
  const { copyToClipboard, handleFindOnPage } = useHelperFunctionStore();
  const [copiedUniqueClass, setCopiedUniqueClass] = useState("");

  const [copied, setCopied] = useState(false);
  const [currentTabId, setCurrentTabId] = useState(null); // ✅ track active tab id
  const [loading, setLoading] = useState(null);

  const [linkStatuses, setLinkStatuses] = useState({}); // store status per uniqueClass

  const tabMismatch = tabId && currentTabId && tabId !== currentTabId;

  const handleCopy = (hrefLink, uniqueClass) => {
    copyToClipboard(hrefLink);
    setCopied(true);
    setCopiedUniqueClass(uniqueClass);
    // Hide message after 1.5 seconds
    setTimeout(() => setCopied(false), 1500);
  };

  // ************************* get current tab id on load & tab switch *****************************//
  const updateCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) setCurrentTabId(tab.id);
  };

  const getLinks = async () => {
    updateCurrentTab();
    const links = await fetchLinks(); // fetch actual data
    processBrokenLinks(links);
  };
  // ********************* get the saved links and check the links. this function will trigger when visiting the page **********************
  const processBrokenLinks = async (links = links) => {
    setRequestTabId(tabId); //save the tabId when processing starts, every request will have its own tabId
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

  useEffect(() => {
    updateCurrentTab();

    // Listener for messages from content.js to get link status
    const handleMessageLinkStatus = (message, sender, sendResponse) => {
      if (message.type === "link-status") {
        // console.log("Received link status:", message);
        setLinkStatuses((prev) => ({
          ...prev,
          [message.href]: message.status,
        }));
      }
    };
    const handleTabChange = (message) => {
      if (message.action === "tabChanged") {
        console.log("🔄 Tab changed, fetching new tab ID...");
        updateCurrentTab();
      }
    };
    chrome.runtime.onMessage.addListener(handleMessageLinkStatus);
    chrome.runtime.onMessage.addListener(handleTabChange);
    // ✅ Cleanup listener on unmount to avoid duplicates
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessageLinkStatus);
      chrome.runtime.onMessage.removeListener(handleTabChange);
    };
  }, []);
  //**************************************end***********************************//

  // ---------------- helper: copy link to clipboard ------------

  return (
    <div className="p-3">
      <div className="flex gap-2 mb-4 flex-col mx-2">
        <span
          className="text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium no-highlight cursor-pointer"
          onClick={async () => {
            await getLinks();
          }}
        >
          Extract & Check Links
        </span>
      </div>

      {loading && (
        <p className="text-sm text-gray-500 mb-2">Checking links...</p>
      )}

      {!loading && requestTabId && brokenLinks.length === 0 && (
        <p className="text-sm text-gray-500 mb-2">No broken links found.</p>
      )}
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
      {brokenLinks.length > 0 && (
        <ol className="list-decimal ml-4 space-y-3">
          {brokenLinks.map((link, i) => (
            <li key={link.uniqueClass} id={`broken-link-${i}`} className="mb-3">
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
                  className="rounded border border-yellow-700 text-xs font-semibold hover:bg-slate-200 py-1 px-2 text-slate-700 cursor-pointer"
                >
                  Copy link
                  {copiedUniqueClass === link.uniqueClass && copied && (
                    <CopyNotificationElement />
                  )}
                </button>
              </div>
              {linkStatuses[link.uniqueClass] === "hidden" && (
                <AlertBoxElement
                  message={`This link is hidden on the page and cannot be displayed. ID: ${link.uniqueClass}`}
                  type="warning"
                />
              )}

              <div>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="leading-none text-base break-words text-slate-600 hover:text-red-600"
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
