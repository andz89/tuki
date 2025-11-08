// src/sidepanel/main.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/headers/header.jsx";
import PageInfo from "./components/pages/pageInfo.jsx";
import AllLinksExtractLinks from "./components/pages/AllLinks-ExtractLinks.jsx";

import BrokenLinks from "./components/pages/BrokenLinks.jsx";
import LinksHeader from "./components/headers/LinkHeader.jsx";
import HoverLinks from "./components/pages/HoverLinks.jsx";
import PageChangeWatcher from "./components/helper/PageChangeWatcher.jsx";
import GlobalTextHighlighter from "./components/helper/GlobalTextHighlighter.jsx";
import InputSearch from "./components/helper/inputSearch.jsx";

function InnerApp() {
  const [isInjected, setIsInjected] = useState(false);
  const handlePageChange = (path) => {
    console.log("⚠️ User switched to another page:", path);
    // Stop fetching, reset state, or show warning here
    // Example:
    // stopHoveringLink();
    // setIsFetching(false);
  };
  async function loadFunctions() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      chrome.scripting.executeScript(
        {
          target: { tabId },
          files: ["content.js"],
        },
        () => {
          if (chrome.runtime.lastError) {
            console.warn(
              "Injection warning:",
              chrome.runtime.lastError.message
            );
          } else {
            console.log("✅ content.js injected");
          }
          // Either way, mark it as injected to proceed
          setIsInjected(true);
        }
      );
    });
  }
  useEffect(() => {
    // initial injection
    loadFunctions();
  }, []);

  if (!isInjected) {
    return (
      <div className="p-4 text-gray-600 text-sm">Loading... Please wait.</div>
    );
  }
  const location = useLocation();
  const showLinksHeader = [
    "/links",
    "/broken-links",
    "/target-section",
  ].includes(location.pathname);
  return (
    <div className="bg-white">
      <div className="sticky top-0 z-50 ">
        <Header />
        {showLinksHeader && <LinksHeader />}
        <InputSearch />
      </div>

      <PageChangeWatcher onPageChange={handlePageChange} />
      <GlobalTextHighlighter />
      <div id="pages">
        <Routes>
          <Route path="/" element={<PageInfo />} />
          <Route path="/links" element={<AllLinksExtractLinks />} />
          <Route path="/broken-links" element={<BrokenLinks />} />
          <Route path="/target-section" element={<HoverLinks />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <HashRouter>
      <InnerApp />
    </HashRouter>
  );
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
