import React, { useState } from "react";
import { usePageLinksInspector } from "./useLInkInspectorList.js";
import { useHelperFunctionStore } from "../../store/useHelperFunctionStore.jsx";
import LinksListTemplate from "../../components/templates/LinksList_template.jsx";
import { AlertBoxElement } from "../../components/UI/Notification.jsx";

export default function PageLinksInspectorList() {
  const {
    links,
    linkStatuses,
    loading,
    requestTabId,
    currentTabId,
    startHoveringButton,
    stopHovering,
    isFetching,
  } = usePageLinksInspector();

  const { handleFindOnPage, copyToClipboard } = useHelperFunctionStore();
  const [copiedUniqueClass, setCopiedUniqueClass] = useState("");
  const [copied, setCopied] = useState(false);

  const tabMismatch =
    requestTabId && currentTabId && requestTabId !== currentTabId;

  const handleCopy = (hrefLink, uniqueClass) => {
    copyToClipboard(hrefLink);
    setCopied(true);
    setCopiedUniqueClass(uniqueClass);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="p-3">
      <div className="flex gap-2 mb-4 flex-col mx-2">
        {!isFetching ? (
          <button
            onClick={startHoveringButton}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium no-highlight cursor-pointer"
          >
            Start Hover Mode
          </button>
        ) : (
          <button
            onClick={stopHovering}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium no-highlight cursor-pointer"
          >
            Stop Hover Mode
          </button>
        )}
      </div>

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
      {!loading && links.length === 0 && (
        <p className="text-sm text-gray-500">
          {loading ? "Hovering over the page..." : "No links captured yet."}
        </p>
      )}
      {links.length > 0 && (
        <LinksListTemplate
          links={links}
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
