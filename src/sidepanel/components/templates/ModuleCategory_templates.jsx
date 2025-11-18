import React from "react";

export default function ModuleCategoryTemplate({ element }) {
  if (!element) return null;

  const filteredClasses = element.classes.filter(
    (cls) => cls.includes("tag") || cls.includes("category")
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 border border-gray-200 dark:border-gray-700">
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

      {element.attributes
        .filter((attr) => attr.name !== "class")
        .map((attr, i) => (
          <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">{attr.name}:</span>{" "}
            <code className="text-gray-600 dark:text-gray-400">
              {attr.value}
            </code>
          </p>
        ))}

      {element.innerText && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
          Preview text: "{element.innerText}"
        </p>
      )}
    </div>
  );
}
