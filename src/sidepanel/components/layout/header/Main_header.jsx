import React from "react";
import { NavLink, useLocation } from "react-router-dom";

const header = () => {
  const location = useLocation();
  const isLinksActive = ["/links", "/broken-links", "/target-section"].includes(
    location.pathname
  );
  const isHTMLActive = ["/html", "/create-tag"].includes(location.pathname);
  return (
    <div className="bg-white">
      <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:border-gray-700 dark:text-gray-400">
        <li className="">
          <NavLink
            to="/"
            aria-current="page"
            className={({ isActive }) =>
              `inline-block p-2   rounded-t-lg    ${
                isActive
                  ? "text-yellow-500 bg-gray-100 dark:bg-gray-800 dark:text-blue-500"
                  : "inline-block p-2 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`
            }
          >
            Page Info
          </NavLink>
        </li>
        <li className="">
          <NavLink
            to="/links"
            className={({}) =>
              `inline-block p-2   rounded-t-lg    ${
                isLinksActive
                  ? "text-yellow-500 bg-gray-100 dark:bg-gray-800 dark:text-blue-500"
                  : "inline-block p-2 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`
            }
          >
            Links
          </NavLink>
        </li>
        <li className="">
          <NavLink
            to="/html"
            className={({}) =>
              `inline-block p-2   rounded-t-lg    ${
                isHTMLActive
                  ? "text-yellow-500 bg-gray-100 dark:bg-gray-800 dark:text-blue-500"
                  : "inline-block p-2 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`
            }
          >
            HTML
          </NavLink>
        </li>
        <li className="">
          <NavLink
            to="/images"
            aria-current="page"
            className={({ isActive }) =>
              `inline-block p-2   rounded-t-lg    ${
                isActive
                  ? "text-yellow-500 bg-gray-100 dark:bg-gray-800 dark:text-blue-500"
                  : "inline-block p-2 rounded-t-lg hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              }`
            }
          >
            Images
          </NavLink>
        </li>
        <li>
          <a className="inline-block p-2 text-gray-400 rounded-t-lg cursor-not-allowed dark:text-gray-500">
            Settings
          </a>
        </li>
      </ul>
    </div>
  );
};

export default header;
