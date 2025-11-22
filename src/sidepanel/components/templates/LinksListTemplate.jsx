import React from "react";
import {
  CopyNotificationElement,
  AlertBoxElement,
} from "../UI/Notification.jsx";

export default function LinksListTemplate({
  links,
  copied,
  copiedUniqueClass,
  linkStatuses,
  tabMismatch,
  onFind,
  onCopy,
}) {
  if (!links || links.length === 0) {
    return <p className="text-sm text-gray-500 mb-2">No broken links found.</p>;
  }

  return (
    <ol className="list-decimal ml-4 space-y-3 ">
      {links.map((link, i) => (
        <li
          key={link.uniqueClass}
          id={`link-${i}`}
          className="mb-3 border p-2 rounded  border-slate-400"
        >
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => onFind(link.uniqueClass)}
              disabled={tabMismatch}
              className={`rounded border border-yellow-700 text-xs font-semibold py-1 px-2 ${
                tabMismatch
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-slate-700 hover:bg-slate-200 cursor-pointer"
              }`}
            >
              Find on the page
            </button>

            <button
              onClick={() => onCopy(link.href, link.uniqueClass)}
              className="rounded border border-yellow-700 text-xs font-semibold hover:bg-slate-200 py-1 px-2 text-slate-700 cursor-pointer no-highlight"
            >
              Copy link
              {copiedUniqueClass === link.uniqueClass && copied && (
                <CopyNotificationElement />
              )}
            </button>
          </div>

          {linkStatuses[link.uniqueClass] === "hidden" && (
            <AlertBoxElement
              message={`This link is hidden and cannot be displayed. ID: ${link.uniqueClass}`}
              type="warning"
            />
          )}

          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="leading-none text-sm break-words text-slate-600 hover:text-yellow-600"
          >
            {link.href}
          </a>
          {link.status ? (
            <div className="text-right text-sm">
              <div>Status: {link.status}</div>

              <div className="">
                {link.status === 403 ? "Forbidden" : link.statusText}
              </div>
            </div>
          ) : (
            <div className=" "></div>
          )}
        </li>
      ))}
    </ol>
  );
}
