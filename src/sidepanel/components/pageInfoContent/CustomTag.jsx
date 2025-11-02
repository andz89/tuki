import React, { useEffect, useState } from "react";

export default function CustomTags() {
  const [hyvorTag, setHyvorTag] = useState(null);
  const [error, setError] = useState("");

  async function fetchHyvorTag() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const activeTabId = tab.id;

      chrome.tabs.sendMessage(
        activeTabId,
        { type: "getCustomTag" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
            setError("Cannot access this page's data.");
            return;
          }

          if (!response || !response.data) {
            setError("No response from content script.");
            return;
          }

          if (response.data.length === 0) {
            setError("No hyvor talk comments element found.");
            setHyvorTag(null);
            return;
          }

          setHyvorTag(response.data[0]);
          setError("");
        }
      );
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Error fetching element data.");
    }
  }

  useEffect(() => {
    fetchHyvorTag();

    const listener = (message) => {
      if (message.action === "tabChanged") {
        console.log("🔄 Tab changed, re-fetching element...");
        fetchHyvorTag();
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  // 🧩 Render
  if (error) {
    return <p className="text-sm text-black bg-yellow-500 p-2">{error}</p>;
  }

  if (!hyvorTag) {
    return (
      <div>
        <p className="text-sm text-black bg-yellow-500 p-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 border border-gray-200 dark:border-gray-700">
      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
        hyvor-talk:
      </p>

      {hyvorTag.attributes.length > 0 ? (
        hyvorTag.attributes.map((attr, i) => (
          <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">{attr.name}:</span>{" "}
            <code className="text-gray-600 dark:text-gray-400">
              {attr.value}
            </code>
          </p>
        ))
      ) : (
        <p className="text-sm text-gray-500 italic">No attributes</p>
      )}
    </div>
  );
}
