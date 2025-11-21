import React, { useState } from "react";
import { usePageLinksInspector } from "./useLInkInspectorList.js";

import LinksListTemplate from "../../components/templates/LinksListTemplate.jsx";
import { AlertBoxElement } from "../../components/UI/Notification.jsx";
import Button from "../../components/UI/Button.jsx";
export default function PageLinksInspectorList() {
  const {
    links,
    linkStatuses,
    loading,
    isFetching,
    copied,
    copiedUniqueClass,
    tabMismatch,
    handleFindOnPage,
    handleCopy,
    handleStartHovering,
    stopHovering,
  } = usePageLinksInspector();

  return (
    <div className="px-1">
      {!isFetching ? (
        <Button text={"Start Hover Mode"} onClick={handleStartHovering} />
      ) : (
        <Button
          bgColor={"bg-red-700"}
          hoverBgColor={"hover:bg-red-600"}
          text={" Stop Hover Mode"}
          onClick={stopHovering}
        />
      )}

      {tabMismatch && (
        <AlertBoxElement
          message={
            <>
              <span className="font-medium">Warning alert!</span> Looks like you
              switched tabs! The links below are from your previous tab.
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
