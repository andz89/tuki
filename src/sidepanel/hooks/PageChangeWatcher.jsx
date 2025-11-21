import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PageChangeWatcher({ onPageChange }) {
  const location = useLocation();

  useEffect(() => {
    // Run  custom action when route changes
    if (typeof onPageChange === "function") {
      stopHoveringLink();
    }
  }, [location.pathname, onPageChange]);

  useEffect(() => {
    const handleTabChanged = (message) => {
      if (message.action === "tabChanged") {
        console.log("🔄 Tab switched — stopping hover...");
        stopHoveringLink();
      }

      if (message.action === "tabReload") {
        console.log("🔁 Tab reloaded — reloading app...");
        window.location.reload();
      }
    };

    chrome.runtime.onMessage.addListener(handleTabChanged);

    return () => {
      chrome.runtime.onMessage.removeListener(handleTabChanged);
    };
  }, []);

  return null;
}

const stopHoveringLink = async () => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, { type: "stopHoveringLink" });
    }
  } catch (error) {
    console.warn("Error stopping hover:", error);
  }
};
