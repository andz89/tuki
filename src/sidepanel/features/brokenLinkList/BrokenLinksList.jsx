import React, { useEffect, useState } from "react";
import { useBrokenLinks } from "./useBrokenLinksList.js";
import { useHelperFunctionStore } from "../../store/useHelperFunctionStore.jsx";
import LinksListTemplate from "../../components/templates/LinksList_template.jsx";
import { AlertBoxElement } from "../../components/UI/Notification.jsx";

export default function BrokenLinksPanel() {
  const {
    linkStatuses,
    brokenLinks,
    loading,
    requestTabId,
    copiedUniqueClass,
    handleCopy,
    handleFindOnPage,
    tabMismatch,
    getLinks,
    copied,
  } = useBrokenLinks();

  return (
    <div className="p-3">
      <div className="flex gap-2 mb-4 flex-col mx-2">
        <span
          className="text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium no-highlight cursor-pointer"
          onClick={getLinks}
        >
          Extract & Check Links
        </span>
      </div>

      {loading && (
        <p className="text-sm text-gray-500 mb-2">Checking links...</p>
      )}
      {!loading && requestTabId && brokenLinks.length === 0 && (
        <p className="text-sm text-gray-500 mb-2">No broken links found.</p>
      )}

      {tabMismatch && (
        <AlertBoxElement
          message={
            <>
              <span className="font-medium">Warning alert!</span> ⚠️ Looks like
              you switched tabs! The links below are from your previous tab.
            </>
          }
          type="warning"
        />
      )}

      {brokenLinks.length > 0 && (
        <LinksListTemplate
          links={brokenLinks}
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
