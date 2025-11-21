import { useHtmlChecker } from "../../store/useHtmlChekerStore";
import { validateHtmlPage } from "./useHtmlChecker";
import Button from "../../components/UI/Button";
export default function HtmlScanner() {
  const { results, error, loading } = useHtmlChecker();
  return (
    <div className="px-1 text-sm">
      <Button
        text={loading ? "Checking..." : "Validate Page HTML"}
        disabled={loading}
        onClick={validateHtmlPage}
      />

      {error && !loading && <p className="text-red-600 mt-3"> {error}</p>}

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
