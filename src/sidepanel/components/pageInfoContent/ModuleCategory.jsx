import React, { useState, useEffect } from "react";

export default function ModuleCategory() {
  const [elements, setElements] = useState([]);
  const [error, setError] = useState(null);
  const fetchCategoryElements = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const response = await chrome.tabs.sendMessage(tab.id, {
        type: "getCategoryElements",
      });

      if (!response || !response.data) {
        setError("Cannot access this page's elements.");
        return;
      }

      setElements(response.data);
    } catch (err) {
      console.error("Error:", err.message);
      setError("Cannot access this page's elements.");
    }
  };
  useEffect(() => {
    fetchCategoryElements();
    // listener for tab changes
    const listener = (message) => {
      if (message.action === "tabChanged") {
        console.log("🔄 Tab changed, re-injecting content script...");
        fetchCategoryElements();
      }
    };

    chrome.runtime.onMessage.addListener(listener);

    // ✅ cleanup listener to prevent duplicate alerts or data reloads
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700 my-4">
        <p className="text-red-600 text-sm text-gray-700 dark:text-gray-300">
          {error}
        </p>
      </div>
    );
  }

  if (elements.length === 0) {
    return (
      <div>
        <p className="text-sm text-black bg-yellow-500 text-sm p-2">
          No Speaker Module Category found.
        </p>
      </div>
    );
  }

  return (
    <div>
      {elements.map((el, index) => {
        const tagName = el.tagName.toLowerCase();
        const filteredClasses = el.classes.filter(
          (cls) => cls.includes("tag") || cls.includes("category")
        );

        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-2   border border-gray-200 dark:border-gray-700"
          >
            <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
              Speaker Module Category
            </p>

            {filteredClasses.length > 0 && (
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-medium">Category:</span>{" "}
                <code className="text-gray-600 dark:text-gray-400">
                  {filteredClasses.join(" ")}
                </code>
              </p>
            )}

            {el.attributes
              .filter((attr) => attr.name !== "class")
              .map((attr, i) => (
                <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">{attr.name}:</span>{" "}
                  <code className="text-gray-600 dark:text-gray-400">
                    {attr.value}
                  </code>
                </p>
              ))}

            {el.innerText && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                Preview text: "{el.innerText}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
