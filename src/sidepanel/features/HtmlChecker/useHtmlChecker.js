import { HTMLHint } from "htmlhint";
import { useHtmlChecker } from "../../store/useHtmlChekerStore";
import { checkHtmlApi } from "./HtmlCheckerApi";
export async function validateHtmlPage() {
  const { setResults, setError, setLoading, reset } = useHtmlChecker.getState();

  reset();
  setLoading(true);

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.url) {
      setError("No active tab URL found.");
      setLoading(false);
      return;
    }

    const response = await checkHtmlApi(tab.url);

    if (!response.ok) {
      setError(response.error || `${response.status} ${response.statusText}`);
      setLoading(false);
      return;
    }

    const rules = { "tag-pair": true };
    const messages = HTMLHint.verify(response.html, rules);

    const htmlLines = response.html.split("\n");

    const enhanced = messages.map((msg) => {
      const lineIdx = Math.max(0, msg.line - 1);
      const start = Math.max(0, lineIdx - 2);
      const end = Math.min(htmlLines.length, lineIdx + 3);

      const snippet = htmlLines.slice(start, end).map((line, i) => {
        const actualLine = start + i + 1;
        return {
          line: actualLine,
          highlight: actualLine === msg.line,
          text: line,
        };
      });

      return { ...msg, snippet };
    });

    setResults(enhanced);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}
