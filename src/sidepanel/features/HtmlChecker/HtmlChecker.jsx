import { useHtmlChecker } from "../../store/useHtmlChekerStore";
import { validateHtmlPage } from "./useHtmlChecker";

export default function HtmlScanner() {
  const { results, error, loading } = useHtmlChecker();
  return (
    <div className="p-3 text-sm">
      <div className="flex gap-2 mb-4 flex-col mx-2">
        <button
          onClick={validateHtmlPage}
          disabled={loading}
          className="text-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium no-highlight cursor-pointer"
        >
          {loading ? "Checking..." : "Validate Page HTML"}
        </button>
      </div>

      {error && <p className="text-red-600 mt-3">⚠️ {error}</p>}

      {results.length > 0 && (
        <ul className="mt-3 space-y-4">
          {results.map((r, i) => (
            <li key={i} className="text-blue-800 flex flex-col">
              <span>
                <b>{r.rule.id}</b>:{" "}
                {r.message.replace(/\s*on line.*$/, "").trim()}
              </span>

              <div className="bg-gray-100 p-2 rounded overflow-x-auto mt-1">
                {r.snippet.map((line, idx) => (
                  <div
                    key={idx}
                    className={`font-mono text-xs ${
                      line.highlight ? "bg-yellow-200" : ""
                    }`}
                  >
                    {line.text}
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {results.length === 0 && !loading && !error && (
        <p className="mt-3 text-green-800">No tag errors found</p>
      )}
    </div>
  );
}
