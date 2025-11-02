import { useEffect, useState } from "react";
import { useLinkStore } from "../../store/useLinkStore";
import { useNavigate } from "react-router-dom";

export default function BrokenLinksPanel() {
  const {
    allLinks,
    brokenLinks,
    addBrokenLink,
    resetBrokenLinks,
    fetchLinks,
    requestTabId,
    error,
    tabId,
    setRequestTabId,
  } = useLinkStore();
  const [currentTabId, setCurrentTabId] = useState(null); // ✅ track active tab id
  const [loading, setLoading] = useState(false);
  const tabMismatch =
    requestTabId && currentTabId && requestTabId !== currentTabId;
  // --- get current tab id on load & tab switch ---
  const updateCurrentTab = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) setCurrentTabId(tab.id);
  };

  useEffect(() => {
    updateCurrentTab();

    const handleTabChange = (message) => {
      if (message.action === "tabChanged") {
        console.log("🔄 Tab changed, fetching new tab ID...");
        updateCurrentTab();
      }
    };

    chrome.runtime.onMessage.addListener(handleTabChange);
    return () => chrome.runtime.onMessage.removeListener(handleTabChange);
  }, []);

  const processBrokenLinks = async () => {
    setRequestTabId(tabId);
    setLoading(true);
    resetBrokenLinks(); // clear previous broken links

    const fetchPromises = allLinks.map((data) => {
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
    if (allLinks.length > 0 && brokenLinks.length === 0) {
      processBrokenLinks();
    }

    const handleTabChange = (message) => {
      if (message.action === "tabChanged") {
        console.log(
          "🔄 Tab changed, clearing stored links and resetting state..."
        );

        fetchLinks();
      }
    };

    chrome.runtime.onMessage.addListener(handleTabChange);

    // ✅ Cleanup listener on unmount to avoid duplicates
    return () => chrome.runtime.onMessage.removeListener(handleTabChange);
  }, []);

  const handleFindOnPage = (uniqueClass) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "window-displayLink",
        targetHref: uniqueClass, // match content.js
      });
    });
  };

  const handleCopy = (href) => {
    navigator.clipboard.writeText(href);
  };
  // --- check if user switched tab ---

  return (
    <div className="p-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-lg">Broken Links</h2>
        <span
          className="text-sm  bg-yellow-500 font-medium rounded-sm p-2 text-black cursor-pointer"
          onClick={async () => {
            // resetBrokenLinks();
            // await fetchLinks();
            await processBrokenLinks();
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
        <p className="text-red-600 text-sm mt-2">
          ⚠️ You switched tabs — data may be outdated. Please click “Refresh”.
        </p>
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
