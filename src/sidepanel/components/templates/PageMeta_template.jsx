// src/components/templates/PageMetaTemplate.jsx
import React from "react";

export default function PageMetaTemplate({ data }) {
  const { title, description, lang, canonical } = data || {};

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-2 border border-gray-200 dark:border-gray-700">
      <p className="text-base font-medium text-gray-800 dark:text-gray-200 mb-1">
        Page Details
      </p>

      <div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Title:
        </span>{" "}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {title ? (
            title
          ) : (
            <span className="text-red-600 text-sm">No title available.</span>
          )}
        </span>
      </div>

      <div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Description:
        </span>{" "}
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {description ? (
            description
          ) : (
            <span className="text-red-600 text-sm">
              No description available.
            </span>
          )}
        </span>
      </div>

      <div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Language:
        </span>{" "}
        <span className="text-sm text-gray-600 dark:text-gray-400">{lang}</span>
      </div>

      <div>
        <span className="font-semibold">Canonical:</span>{" "}
        <a
          href={canonical}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-pink-600"
        >
          {canonical}
        </a>
      </div>
    </div>
  );
}
