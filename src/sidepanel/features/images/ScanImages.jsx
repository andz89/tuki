// src/components/Panel/ScanImages.jsx
import React, { useState } from "react";
import { useScanImagesStore } from "../../store/useScanImagesStore.jsx";
import { useScanImages } from "./useScanImages.js";
import { copyToClipboard } from "../../utils/clipboardUtils.js";
import { CopyNotificationElement } from "../../components/UI/Notification.jsx";

export default function ScanImages() {
  // const results = useScanImagesStore((s) => s.results);
  // const brokenCount = useScanImagesStore((s) => s.brokenCount);

  const { results, brokenCount } = useScanImagesStore();
  const { loading, scanImages } = useScanImages();

  const [copiedUniqueClass, setCopiedUniqueClass] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = (hrefLink, index) => {
    copyToClipboard(hrefLink);
    setCopied(true);
    setCopiedUniqueClass(index);
    setTimeout(() => setCopied(false), 1500);
  };

  // Sort broken images first
  const sortedResults = [...results].sort((a, b) =>
    a.ok === b.ok ? 0 : a.ok ? 1 : -1
  );

  return (
    <div className="p-4 text-sm">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={scanImages}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Scanning..." : "Scan Images"}
        </button>
        <div className="mb-3 font-semibold text-red-600">
          Broken images found: {brokenCount}
        </div>
      </div>

      <div className="mt-4">
        {sortedResults.map((res, index) => (
          <div
            key={index}
            className={`border p-2 rounded mb-2 ${
              res.ok ? "border-green-500" : "border-red-500"
            }`}
          >
            <a
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all"
            >
              {res.url}
            </a>
            <div className="flex items-center justify-between">
              <button
                onClick={() => handleCopy(res.url, index)}
                className="rounded border border-slate-400 text-xs font-semibold hover:bg-slate-200 py-1 px-2 text-slate-700 cursor-pointer no-highlight"
              >
                Copy Source
                {copiedUniqueClass === index && copied && (
                  <CopyNotificationElement />
                )}
              </button>
              <div className="text-right">
                <div>Status: {res.status}</div>
                {!res.ok && <div className="text-red-700"> Broken Image</div>}
                {res.ok && <div className="text-green-700"> OK</div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
