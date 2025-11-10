import React, { useState } from "react";
import { HTMLHint } from "htmlhint";

export default function PanelValidator() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validateHTML = async () => {
    setLoading(true);
    setResults([]);
    setError(null);

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.url) {
        setError("No active tab URL found.");
        setLoading(false);
        return;
      }

      const response = await chrome.runtime.sendMessage({
        type: "FETCH_PAGE_HTML",
        url: tab.url,
      });

      if (!response.ok) {
        setError(response.error || `${response.status} ${response.statusText}`);
        setLoading(false);
        return;
      }

      const rules = { "tag-pair": true }; // detect unclosed tags
      const messages = HTMLHint.verify(response.html, rules);

      const htmlLines = response.html.split("\n");
      const enhancedMessages = messages.map((msg) => {
        const lineIndex = Math.max(0, msg.line - 1);
        const start = Math.max(0, lineIndex - 2); // 2 lines before
        const end = Math.min(htmlLines.length, lineIndex + 3); // 2 lines after
        const snippet = htmlLines.slice(start, end).map((line, idx) => {
          const actualLine = start + idx + 1;
          const highlight = actualLine === msg.line ? "bg-yellow-200" : "";
          return (
            <div key={idx} className={`font-mono text-xs ${highlight}`}>
              {/* <span className="text-gray-500 mr-2">{actualLine}</span> */}
              <span>{line}</span>
            </div>
          );
        });
        return { ...msg, snippet };
      });

      setResults(enhancedMessages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 text-sm">
      <div className="flex gap-2 mb-4 flex-col mx-2">
        <button
          onClick={validateHTML}
          disabled={loading}
          className="text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium no-highlight cursor-pointer"
        >
          {loading ? "Checking..." : "Validate Page HTML"}
        </button>
      </div>

      {error && <p className="text-red-600 mt-3">⚠️ {error}</p>}

      {results.length > 0 && (
        <ul className="mt-3 space-y-4">
          {results.map((r, i) => (
            <li key={i} className="text-blue-800 flex flex-col">
              <span>
                <b>{r.rule.id}</b>:{" "}
                {r.message.replace(/\s*on line.*$/, "").trim()}
              </span>
              {r.snippet && (
                <div className="bg-gray-100 p-2 rounded overflow-x-auto mt-1">
                  {r.snippet}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {results.length === 0 && !loading && !error && (
        <p className="mt-3 text-green-800">No tag errors found</p>
      )}
    </div>
  );
}
