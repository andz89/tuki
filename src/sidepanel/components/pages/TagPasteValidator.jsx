// TagPasteValidator.jsx
export default function TagPasteValidator() {
  return (
    <div className="tag-paste-validator">
      <textarea placeholder="Paste your HTML tag here..." />
      <button>Check Unclosed Tags</button>
    </div>
  );
}
