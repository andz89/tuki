import { useBrokenLinks } from "./useBrokenLinksList.js";
import Button from "../../components/UI/Button.jsx";
import LinksListTemplate from "../../components/templates/LinksListTemplate.jsx";
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
    <div className="px-1 ">
      <Button
        text={loading ? "Checking..." : "Extract & Check Links"}
        disabled={loading}
        onClick={getLinks}
      />

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
              <span className="font-medium">Warning alert!</span> Looks like you
              switched tabs! The links below are from your previous tab.
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
