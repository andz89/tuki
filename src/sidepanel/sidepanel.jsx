import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";

import Header from "./components/layout/header/Main_header.jsx";
import PageInfo from "./pages/pageInfo.jsx";
import Links from "./pages/links/Links.jsx";

import BrokenLinks from "./pages/links/BrokenLinks.jsx";
import LinksHeader from "./components/layout/header/Links_header.jsx";
import LinkInspector from "./pages/links/LinkInspector.jsx";
import PageChangeWatcher from "./hooks/PageChangeWatcher.jsx";
import GlobalTextHighlighter from "./hooks/GlobalTextHighlighter.jsx";
import InputSearch from "./components/UI/InputSearch.jsx";
import Html from "./pages/Html.jsx";
import ScanImages from "./pages/ScanImages.jsx";

function InnerApp() {
  const [isInjected, setIsInjected] = useState(false);

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
            console.log("Injection error:", chrome.runtime.lastError.message);
          } else {
            console.log(" content.js injected");
          }

          setIsInjected(true);
        }
      );
    });
  }
  useEffect(() => {
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
    "/link-inspector",
  ].includes(location.pathname);

  return (
    <div className="bg-white">
      <div className="sticky top-0 z-50 ">
        <Header />
        {showLinksHeader && <LinksHeader />}

        <InputSearch />
      </div>

      <PageChangeWatcher onPageChange={(path) => {}} />
      <GlobalTextHighlighter />

      <div id="pages">
        <Routes>
          <Route path="/" element={<PageInfo />} />
          <Route path="/links" element={<Links />} />
          <Route path="/broken-links" element={<BrokenLinks />} />
          <Route path="/link-inspector" element={<LinkInspector />} />
          <Route path="/html" element={<Html />} />
          <Route path="/images" element={<ScanImages />} />
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
