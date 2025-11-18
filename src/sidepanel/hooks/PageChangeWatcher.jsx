import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PageChangeWatcher({ onPageChange }) {
  const location = useLocation();

  useEffect(() => {
    console.log("🧭 User navigated to:", location.pathname);

    // Run your custom action when route changes
    if (typeof onPageChange === "function") {
      // onPageChange(location.pathname);
      stopHoveringLink();
    }
  }, [location.pathname, onPageChange]);

  useEffect(() => {
    // 🔹 Handle tab change from background.js
    const handleTabChanged = (message) => {
      if (message.action === "tabChanged") {
        console.log("🔄 Tab switched — stopping hover...");
        stopHoveringLink();
      }

      if (message.action === "tabReload") {
        console.log("🔁 Tab reloaded — reloading app...");
        window.location.reload(); // 🔹 reload your extension React UI
      }
    };

    // Listen for messages sent from background.js
    chrome.runtime.onMessage.addListener(handleTabChanged);

    // Cleanup
    return () => {
      chrome.runtime.onMessage.removeListener(handleTabChanged);
    };
  }, []);

  return null; // This component doesn’t render anything
}

// 🔹 Stop hover action (helper)
const stopHoveringLink = async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, { type: "stopHoveringLink" });
      console.log("🛑 Hovering stopped on tab", tab.id);
    }
  } catch (error) {
    console.warn("Error stopping hover:", error);
  }
};
