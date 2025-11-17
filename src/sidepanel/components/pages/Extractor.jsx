import { useState, useEffect } from "react";

const Extractor = () => {
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
          pageId: data.pageId || "-",
          totalReacts: data.totalReacts || "-", // if you include it later
          featuredImages: {
            og: data.featuredImages?.og || "-",
            twitter: data.featuredImages?.twitter || "-",
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
      <button
        onClick={extractPageInfo}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Extracting..." : "Extract Page Info"}
      </button>

      {error && <p className="mt-2 text-red-600">{error}</p>}

      {extractedData && (
        <div className="mt-3 border p-2 rounded bg-gray-100">
          <p>
            <strong>Title:</strong> {extractedData.title}
          </p>
          <p>
            <strong>Description:</strong> {extractedData.description}
          </p>
          <p>
            <strong>Canonical:</strong> {extractedData.canonical}
          </p>
          <p>
            <strong>Hyvor Page ID:</strong> {extractedData.pageId}
          </p>
          <p>
            <strong>Number of Reacts:</strong> {extractedData.totalReacts}
          </p>
          <p>
            <strong>Featured Images:</strong>
          </p>
          <ul className="ml-4 list-disc">
            <li>
              <strong>OG:</strong>{" "}
              <img src={extractedData.featuredImages?.og} alt="OG image" />
            </li>
            <li>
              <strong>Twitter:</strong>
              <img src={extractedData.featuredImages?.twitter} />
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Extractor;
