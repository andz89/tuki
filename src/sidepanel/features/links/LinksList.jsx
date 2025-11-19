import { useEffect, useState } from "react";

import { AlertBoxElement } from "../../components/UI/Notification.jsx";
import LinksListTemplate from "../../components/templates/LinksList_template.jsx";
import { useLinksList } from "./useLinksList.js";
import { handleFindOnPage } from "./linksListApi.js";
export default function LinksPanel() {
  const {
    allLinks,
    error,
    tabMismatch,
    linkStatuses,
    loading,
    copied,
    copiedUniqueClass,
    getLinks,
    handleCopy,
  } = useLinksList();

  // const [copiedUniqueClass, setCopiedUniqueClass] = useState("");

  return (
    <div className="p-3">
      {/* Extract button */}
      <div className="flex gap-2 mb-4 flex-col mx-2">
        <span
          className="text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium no-highlight cursor-pointer"
          onClick={getLinks}
        >
          Extract Links
        </span>
      </div>

      {/* Tab mismatch warning */}
      {tabMismatch && (
        <AlertBoxElement
          message={
            <>
              <span className="font-medium">Warning:</span> ⚠️ You switched tabs
              — results belong to previous tab.
            </>
          }
          type="warning"
        />
      )}

      {/* Store error */}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

      {/* Loading */}
      {loading ? (
        <p className="text-sm text-gray-500 no-highlight">Loading links...</p>
      ) : (
        <LinksListTemplate
          links={allLinks}
          copied={copied}
          copiedUniqueClass={copiedUniqueClass}
          linkStatuses={linkStatuses}
          tabMismatch={tabMismatch}
          onFind={handleFindOnPage}
          onCopy={handleCopy}
        />
      )}
    </div>
  );
}
