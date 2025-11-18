import React, { useState } from "react";
import { HTMLHint } from "htmlhint";

export default function Input_tags() {
  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const validateSnippet = () => {
    setResults([]);
    setError(null);

    if (!input.trim()) {
      setError("Please paste some HTML to validate.");
      return;
    }

    try {
      // Rules: detect unclosed tags, etc.
      const rules = { "tag-pair": true };
      const messages = HTMLHint.verify(input, rules);
      setResults(messages);
    } catch (err) {
      setError("Validation failed: " + err.message);
    }
  };

  return (
    <div className="p-3 text-sm">
      <h2 className="font-semibold mb-2 text-lg">Snippet Tag Validator</h2>

      <textarea
        className="w-full dark:bg-gray-800 rounded-sm shadow p-2 border border-gray-200 dark:border-gray-200 w-full 
               focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300 h-40"
        placeholder="Paste your HTML snippet here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={validateSnippet}
        className="mt-3 bg-blue-600 text-white rounded-lg px-3 py-2"
      >
        Validate Snippet Tag
      </button>

      {error && <p className="text-red-600 mt-3">⚠️ {error}</p>}

      {results.length > 0 && (
        <ul className="mt-3 space-y-1">
          {results.map((r, i) => (
            <li key={i} className="text-blue-800">
              <b>{r.rule.id}</b>:{" "}
              {r.message.replace(/\s*on line.*$/, "").trim()}
            </li>
          ))}
        </ul>
      )}

      {results.length === 0 && !error && input.trim() && (
        <p className="mt-3 text-green-800"> No tag errors found</p>
      )}
    </div>
  );
}
