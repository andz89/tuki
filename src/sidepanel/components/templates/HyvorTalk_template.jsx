import React from "react";

export default function HyvorTalkTemplate({ hyvorTag }) {
  if (!hyvorTag) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 border border-gray-200 dark:border-gray-700">
      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
        Hyvor-Talk:
      </p>

      {hyvorTag.attributes && hyvorTag.attributes.length > 0 ? (
        hyvorTag.attributes.map((attr, i) => (
          <p key={i} className="text-sm text-gray-700 dark:text-gray-300">
            <span className="font-medium">{attr.name}:</span>{" "}
            <code className="text-gray-600 dark:text-gray-400">
              {attr.value}
            </code>
          </p>
        ))
      ) : (
        <p className="text-sm text-gray-500 italic">No attributes</p>
      )}
    </div>
  );
}
