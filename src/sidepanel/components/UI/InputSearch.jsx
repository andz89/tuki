import useMarkText from "../../hooks/GlobalTextHighlighter.jsx";

export default function InputSearch() {
  useMarkText();

  return (
    <div className="p-1 sticky top-20 z-50 bg-white">
      <input
        id="highlight-input"
        placeholder="Type to highlight text..."
        className="dark:bg-gray-800 rounded-sm shadow p-2 border border-gray-200 dark:border-gray-200 w-full 
               focus:outline-none focus:border-gray-300 focus:ring-1 focus:ring-gray-300"
      />
    </div>
  );
}
