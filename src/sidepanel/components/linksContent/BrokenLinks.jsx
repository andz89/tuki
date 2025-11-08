import { use, useEffect, useState } from "react";
import { useLinkStore } from "../../store/useLinkStore";
import { useNavigate } from "react-router-dom";
import AlertBox from "../helper/notification";
export default function BrokenLinksPanel() {
  const {
    allLinks,
    brokenLinks,
    addBrokenLink,
    resetBrokenLinks,
    tabId,
    fetchLinks,
    setRequestTabId,
  } = useLinkStore();

  const [currentTabId, setCurrentTabId] = useState(null); // ✅ track active tab id
  const [loading, setLoading] = useState(false);
  const [linkStatuses, setLinkStatuses] = useState({}); // store status per uniqueClass

  const tabMismatch = tabId && currentTabId && tabId !== currentTabId;

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
  const processBrokenLinks = async (links = allLinks) => {
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

    if (allLinks.length > 0 && brokenLinks.length === 0) {
      processBrokenLinks(allLinks);
    }

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

  // ---------------- helper: find the target link on the page ------------
  const handleFindOnPage = (uniqueClass) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "window-displayLink",
        targetHref: uniqueClass, // match content.js
      });
    });
  };
  // ---------------- helper: copy link to clipboard ------------
  const handleCopy = (href) => {
    navigator.clipboard.writeText(href);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-gray-800 text-lg no-highlight">
          Broken Links
        </h2>
        <span
          className="text-sm  bg-yellow-500 font-medium rounded-sm p-2 text-black cursor-pointer no-highlight"
          onClick={async () => {
            await getLinks();
          }}
        >
          Refresh
        </span>
      </div>

      {loading && (
        <p className="text-sm text-gray-500 mb-2">Checking links...</p>
      )}

      {!loading && brokenLinks.length === 0 && (
        <p className="text-sm text-gray-500 mb-2">No broken links found.</p>
      )}
      {tabMismatch && (
        <AlertBox
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
                  onClick={() => handleCopy(link.href)}
                  className="rounded border border-yellow-700 text-xs font-semibold hover:bg-slate-200 py-1 px-2 text-slate-700 cursor-pointer"
                >
                  Copy link
                </button>
              </div>
              {linkStatuses[link.uniqueClass] === "hidden" && (
                <AlertBox
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
