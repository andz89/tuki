// src/components/pages/PageInfo.jsx
import React, { useEffect, useState } from "react";
import {
  CopyNotificationElement,
  AlertBoxElement,
} from "../helper/Notification.jsx";
export default function FeaturedImages() {
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMetaData() {
      try {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });

        if (!tab?.id) {
          setError("No active tab found.");
          return;
        }

        chrome.tabs.sendMessage(tab.id, { type: "getMetaData" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error:", chrome.runtime.lastError.message);
            setError("Cannot access this page's Meta Data.");
            return;
          }

          setImages(response?.data || []);
          setError("");
        });
      } catch (err) {
        console.error("Meta fetch error:", err);
        setError("Error fetching meta data.");
      }
    }

    fetchMetaData();

    // Listener for tab changes
    const listener = (message) => {
      if (message.action === "tabChanged") {
        console.log("🔄 Tab changed, refetching meta data...");
        fetchMetaData();
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return (
    <div>
      {error && (
        <AlertBoxElement
          message={<>Oops! Something went wrong. Please refresh the page.</>}
          type="error"
        />
      )}

      {images.length === 0 && !error ? (
        <AlertBoxElement
          message={<>No featuredImages found on this page.</>}
          type="info"
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 border border-gray-200 dark:border-gray-700">
          <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
            Featured Images
          </p>
          <div className="flex flex-col gap-4">
            {images.map(({ property, url }, index) => (
              <div key={index}>
                <span className="block mb-1 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {property}{" "}
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-xs break-words hover:text-pink-600"
                  >
                    {url}
                  </a>
                </span>
                <img
                  src={url}
                  alt={property}
                  className="mt-2 max-w-full rounded bg-slate-200 p-2"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
