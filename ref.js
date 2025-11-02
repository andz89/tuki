// src/sidepanel/main.jsx
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";

import Header from "./components/header.jsx";
import PageInfo from "./components/pages/pageInfo.jsx";
import Links from "./components/pages/links.jsx";

function App() {
  const [isInjected, setIsInjected] = useState(false);

  useEffect(() => {
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

    loadFunctions();
  }, []);

  if (!isInjected) {
    return (
      <div className="p-4 text-gray-600 text-sm">Loading... Please wait.</div>
    );
  }

  return (
    <div className="p-2">
      <HashRouter>
        <Header />
        <Routes>
          <Route path="/" element={<PageInfo />} />
          <Route path="/links" element={<Links />} />
        </Routes>
      </HashRouter>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
