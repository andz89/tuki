import React, { useEffect, useState } from "react";
import {
  CopyNotificationElement,
  AlertBoxElement,
} from "../helper/Notification.jsx";
export default function PageDetails() {
  const [pageInfo, setPageInfo] = useState({
    title: "",
    description: "",
    lang: "",
    canonical: "",
    error: "",
  });
  async function fetchPageDetails() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const activeTabId = tab.id;

      chrome.tabs.sendMessage(
        activeTabId,
        { type: "getPageInfo" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
            setPageInfo((prev) => ({
              ...prev,
              error: "Cannot access this page’s meta data.",
            }));
            return;
          }

          if (!response) {
            setPageInfo((prev) => ({
              ...prev,
              error: "No response from content script.",
            }));
            return;
          }

          setPageInfo({
            title: response.title || "No title available.",
            description: response.description || "No description available.",
            lang: response.lang || "Not specified.",
            canonical: response.canonical || "No canonical available.",
            error: "",
          });
        }
      );
    } catch (err) {
      console.error("Meta fetch error:", err);
      setPageInfo((prev) => ({
        ...prev,
        error: "Error fetching page details.",
      }));
    }
  }
  useEffect(() => {
    fetchPageDetails();
    // listener for tab changes
    const listener = (message) => {
      if (message.action === "tabChanged") {
        console.log("🔄 Tab changed, re-injecting content script...");
        fetchPageDetails();
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    // ✅ cleanup listener to prevent duplicate alerts or data reloads
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2   border border-gray-200 dark:border-gray-700">
      {pageInfo.error ? (
        <AlertBoxElement
          message={<>Oops! Something went wrong. Please refresh the page.</>}
          type="error"
        />
      ) : (
        <div className=" ">
          <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
            Page Details
          </p>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Title:
            </span>{" "}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {pageInfo.title ? (
                pageInfo.title
              ) : (
                <span className="text-red-600 text-sm">
                  No title available.
                </span>
              )}
            </span>
          </div>
          <div>
            <span className=" text-sm font-medium text-gray-700 dark:text-gray-300">
              Description:
            </span>{" "}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {pageInfo.description ? (
                pageInfo.description
              ) : (
                <span className="text-red-600 text-sm">
                  No description available.
                </span>
              )}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Language:
            </span>{" "}
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {pageInfo.lang}
            </span>
          </div>
          <div>
            <span className="font-semibold">Canonical:</span>{" "}
            <a
              href={pageInfo.canonical}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-pink-600"
            >
              {pageInfo.canonical}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
