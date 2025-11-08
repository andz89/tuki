import { useEffect, useState } from "react";
import { useLinkStore } from "../../store/useLinkStore";
import AlertBox from "../helper/notification";
export default function LinksPanel() {
  // const [links, setLinks] = useState([]);

  const [linkStatuses, setLinkStatuses] = useState({}); // store status per uniqueClass
  // 🔹 Fetch all links from the current active tab

  const { allLinks, setAllLinks, fetchLinks, loading, error } = useLinkStore();
  useEffect(() => {
    const getLinks = async () => {
      const links = await fetchLinks(); // fetch actual data
      setAllLinks(links); // now set the real data
    };

    getLinks();

    // Re-fetch when tab changes
    const listener = (message) => {
      if (message.action === "tabChanged") {
        console.log("🔄 Tab changed, fetching links again...");
        getLinks(); // re-fetch and update store
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
      chrome.runtime.onMessage.removeListener(listener);
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // helper: copy link to clipboard
  const handleCopy = (href) => {
    navigator.clipboard.writeText(href);
  };

  const handleFindOnPage = (uniqueClass) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "window-displayLink",
        targetHref: uniqueClass, // match content.js
      });
    });
  };

  return (
    <div className="p-3">
      <h2 className="font-semibold text-gray-800 mb-3 text-lg no-highlight">
        Extracted Links
      </h2>
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      {allLinks.length === 0 && !error ? (
        <p className="text-sm text-gray-500 no-highlight">Loading links...</p>
      ) : (
        <ol className="list-decimal ml-4 space-y-3">
          {allLinks.map((link, i) => (
            <li key={link.uniqueClass} id={`link-${i}`} className="mb-3">
              <div className="flex justify-left items-center mb-2 gap-2">
                <button
                  onClick={() => handleFindOnPage(link.uniqueClass)}
                  data-link={link.uniqueClass}
                  className="rounded border border-yellow-700 text-xs font-semibold hover:bg-slate-200 py-1 px-2 text-slate-700 cursor-pointer no-highlight"
                >
                  Find on the page
                </button>

                <button
                  onClick={() => handleCopy(link.href)}
                  className="rounded border border-yellow-700 text-xs font-semibold hover:bg-slate-200 py-1 px-2 text-slate-700 cursor-pointer no-highlight"
                >
                  Copy link
                </button>
              </div>

              <div>
                {linkStatuses[link.uniqueClass] === "hidden" && (
                  <AlertBox
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
