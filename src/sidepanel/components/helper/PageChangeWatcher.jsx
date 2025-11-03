import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function PageChangeWatcher({ onPageChange }) {
  const location = useLocation();

  useEffect(() => {
    console.log("🧭 User navigated to:", location.pathname);

    // Run your custom action
    if (typeof onPageChange === "function") {
      // onPageChange(location.pathname);
      stopHoveringLink();
    }
  }, [location.pathname, onPageChange]);

  return null; // this component doesn’t render anything
}
// 🔹 Stop hover action
const stopHoveringLink = async () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { type: "stopHoveringLink" });
  });
};
