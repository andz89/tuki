import { useState, useEffect } from "react";

const Extractor = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [extractedData, setExtractedData] = useState({
    title: null,
    description: null,
    canonical: null,
    pageId: null,
    totalReacts: null,
    featuredImages: { og: null, twitter: null },
  });

  const handleChange = (e) => {
    const checked = e.target.checked;
    setIsChecked(checked);

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;

      chrome.tabs.sendMessage(
        tab.id,
        { type: "HoverMode_ExtractingPageInfo_Start", isChecked: checked },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(
              "Cannot access this page’s info:",
              chrome.runtime.lastError
            );
            return;
          }

          if (!response) {
            console.warn("No response from content script.");
            return;
          }

          console.log("Content script response:", response);
        }
      );
    });
  };

  const extractPageInfo = () => {
    if (!url) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);

    chrome.runtime.sendMessage(
      { type: "EXTRACT_PAGE_INFO", url },
      (response) => {
        if (chrome.runtime.lastError) {
          setError(chrome.runtime.lastError.message);
          setLoading(false);
          return;
        }

        if (!response?.ok) {
          setError(response?.error || "Failed to extract page info");
          setLoading(false);
          return;
        }

        setLoading(false);
      }
    );
  };

  useEffect(() => {
    function handleMessageData(message, sender, sendResponse) {
      if (message.type === "extract-data") {
        const data = message.data;

        setExtractedData({
          title: data.title || "-",
          description: data.description || "-",
          canonical: data.canonical || "-",
          pageId: data.pageId || "Not Found",
          totalReacts: data.totalReacts || "Not Found", // if you include it later
          featuredImages: {
            og: data.featuredImages?.og || null,
            twitter: data.featuredImages?.twitter || null,
          },
        });
      }
      if (message.type === "extract-url") {
        setUrl(message.link || "");
      }
    }

    chrome.runtime.onMessage.addListener(handleMessageData);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessageData);
    };
  }, []);

  return (
    <div className="p-2 text-sm">
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter page URL"
        className="border px-2 py-1 rounded w-full mb-2"
      />
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={extractPageInfo}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {loading ? "Extracting..." : "Extract Page Info"}
        </button>
        <div>
          <label
            className={`${
              isChecked ? "bg-blue-600" : "bg-gray-600"
            } p-1 rounded text-white select-none`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleChange}
            />
            <span className="pl-1 select-none"> Hover Mode</span>
          </label>
        </div>
      </div>

      {error && <p className="mt-2 text-red-600">{error}</p>}

      {extractedData && (
        <div className="mt-3 border p-2 rounded  ">
          <p>
            <strong>Title:</strong> {extractedData.title}
          </p>
          <p>
            <strong>Description:</strong> {extractedData.description}
          </p>
          <p>
            <strong>Canonical:</strong> {extractedData.canonical}
          </p>
          {/* <p>
            <strong>Hyvor Page ID:</strong> {extractedData.pageId}
          </p> */}
          <p>
            <strong>Number of Reacts:</strong> {extractedData.totalReacts}
          </p>
          <p>
            <strong>Featured Images:</strong>
          </p>
          <ul className="ml-4 list-disc">
            <li>
              <strong>OG:</strong>
              {extractedData.featuredImages.og ? (
                <img src={extractedData.featuredImages.og} alt="OG image" />
              ) : (
                ""
              )}
            </li>
            <li>
              <strong>Twitter:</strong>
              {console.log(extractedData.featuredImages.twitter)}
              {extractedData.featuredImages.twitter !== null ? (
                <img src={extractedData.featuredImages.twitter} />
              ) : (
                ""
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Extractor;
