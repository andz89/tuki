import { useEffect, useState } from "react";

export default function ExtractLinks() {
  const [isFetching, setIsFetching] = useState(false);
  const [links, setLinks] = useState([]);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  // 🔹 Listen for LINKS_FOUND messages from the content script
  useEffect(() => {
    const handleMessage = (message) => {
      if (message.type === "LINKS_FOUND") {
        if (!message.links || message.links.length === 0) {
          setLinks([]);
          return;
        }

        // Normalize and remove duplicates
        const normalize = (url) => url.toLowerCase().replace(/\/$/, "");
        const seen = new Set();
        const uniqueLinks = [];

        message.links.forEach((link) => {
          const normalized = normalize(link.href);
          if (!seen.has(normalized)) {
            seen.add(normalized);
            uniqueLinks.push(link);
          }
        });

        setLinks(uniqueLinks);
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // 🔹 Handle fetching links
  const handleFetchLinks = async () => {
    setIsFetching(true);
    setError(null);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      if (!tab?.id) {
        setError("No active tab found.");
        setIsFetching(false);
        return;
      }

      chrome.tabs.sendMessage(
        tab.id,
        { type: "selectElementAndExtractLinks" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "Failed to send message:",
              chrome.runtime.lastError.message
            );
            setError("Failed to communicate with the content script.");
          } else {
            console.log(
              "selectElementAndExtractLinks executed:",
              response?.data
            );
          }
        }
      );
    } catch (err) {
      setError("An error occurred while extracting links.");
    }
  };

  // 🔹 Stop hovering action
  const stopHoveringLink = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) return;

      chrome.tabs.sendMessage(tab.id, { type: "stopHoveringLink" });
    } catch (error) {
      console.error("Error in stopHoveringLink:", error);
    }
  };

  const handleStopFetch = async () => {
    await stopHoveringLink();
    setIsFetching(false);
  };

  const handleFindOnPage = (uniqueClass) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "window-displayLink",
        targetHref: uniqueClass, // match content.js
      });
    });
  };

  const handleCopy = async (href) => {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(href);
      setTimeout(() => setCopied(null), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="p-3">
      {/* Header and Buttons */}
      <div className="flex gap-2 mb-4 flex flex-col mx-2">
        {/* Title */}
        <h3 className="font-semibold text-gray-800 mb-1 text-lg ">
          Extracted links will show below.
        </h3>
        {!isFetching ? (
          <button
            onClick={handleFetchLinks}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            Start Fetch Links
          </button>
        ) : (
          <button
            onClick={handleStopFetch}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium"
          >
            Stop Fetch
          </button>
        )}
      </div>

      {/* No links */}
      {links.length === 0 && !error ? (
        <p className="text-sm text-gray-500">
          {isFetching ? "Hover your mouse on the page." : ""}
        </p>
      ) : (
        <ol className="list-decimal ml-4 space-y-3">
          {links.map((link, i) => (
            <li key={i} id={`link-${i}`} className="mb-3">
              <div className="flex justify-left items-center mb-2 gap-2 flex-wrap">
                <button
                  onClick={() => handleFindOnPage(link.uniqueClass)}
                  className="rounded border border-yellow-700 text-xs font-semibold hover:bg-slate-200 py-1 px-2 text-slate-700 cursor-pointer"
                >
                  Find on the page
                </button>

                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded border border-yellow-700 text-xs font-semibold hover:bg-slate-200 py-1 px-2 text-slate-700 cursor-pointer"
                >
                  Visit link
                </a>

                <button
                  onClick={() => handleCopy(link.href)}
                  className="rounded border border-yellow-700 text-xs font-semibold hover:bg-slate-200 py-1 px-2 text-slate-700 cursor-pointer"
                >
                  {copied === link.href ? "Copied!" : "Copy link"}
                </button>
              </div>

              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="leading-none text-base break-words text-slate-600 hover:text-yellow-600"
              >
                {link.href}
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
