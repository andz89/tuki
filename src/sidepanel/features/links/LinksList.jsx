import { useEffect, useState } from "react";

import { AlertBoxElement } from "../../components/UI/Notification.jsx";
import LinksListTemplate from "../../components/templates/LinksListTemplate.jsx";
import { useLinksList } from "./useLinksList.js";
import { handleFindOnPage } from "./linksListApi.js";
import Button from "../../components/UI/Button.jsx";
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

  return (
    <div className="px-1">
      <Button
        text={loading ? "Extracting..." : "Extract Links"}
        disabled={loading}
        onClick={getLinks}
      />

      {tabMismatch && (
        <AlertBoxElement
          message={
            <>
              <span className="font-medium">Warning:</span> You switched tabs —
              results belong to previous tab.
            </>
          }
          type="warning"
        />
      )}

      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

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
