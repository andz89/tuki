// src/sidepanel/main.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/layout/header/Main_header.jsx";
import PageInfo from "./pages/pageInfo.jsx";
import Links from "./pages/links/Links.jsx";

import BrokenLinks from "./pages/links/BrokenLinks.jsx";
import LinksHeader from "./components/layout/header/Links_header.jsx";
import HoverLinks from "./pages/links/HoverLinks.jsx";
import PageChangeWatcher from "./hooks/PageChangeWatcher.jsx";
import GlobalTextHighlighter from "./hooks/GlobalTextHighlighter.jsx";
import InputSearch from "./components/UI/InputSearch.jsx";
import Html from "./pages/html/Html.jsx";
import HTML_header from "./components/layout/header/HTML_header.jsx";
import Input_tags from "./pages/Input_tags.jsx";
import CreateTag from "./pages/html/CreateTag.jsx";
import Extractor from "./pages/Extractor.jsx";
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
  const showHTMLHeader = ["/html", "/input-tags", "/create-tag"].includes(
    location.pathname
  );
  const hideInput = ["/input-tags", "/html", "/create-tag"].includes(
    location.pathname
  );

  return (
    <div className="bg-white">
      <div className="sticky top-0 z-50 ">
        <Header />
        {showLinksHeader && <LinksHeader />}
        {showHTMLHeader && <HTML_header />}

        {!hideInput && <InputSearch />}
      </div>

      <PageChangeWatcher onPageChange={handlePageChange} />
      <GlobalTextHighlighter />

      <div id="pages">
        <Routes>
          <Route path="/" element={<PageInfo />} />
          <Route path="/links" element={<Links />} />
          <Route path="/broken-links" element={<BrokenLinks />} />
          <Route path="/target-section" element={<HoverLinks />} />
          <Route path="/html" element={<Html />} />
          <Route path="/Extractor" element={<Extractor />} />

          <Route path="/create-tag" element={<CreateTag />} />
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
