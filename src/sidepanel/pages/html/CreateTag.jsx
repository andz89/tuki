import React, { useState, useRef, useEffect } from "react";
import { html as beautifyHtml } from "js-beautify";
import { HTMLHint } from "htmlhint";
import {
  CopyNotificationElement,
  AlertBoxElement,
} from "../../components/UI/Notification.jsx";
import { useHelperFunctionStore } from "../../store/useHelperFunctionStore.jsx";
const commonTags = [
  "div",
  "span",
  "p",
  "a",
  "img",
  "button",
  "input",
  "ul",
  "li",
  "section",
  "article",
  "header",
  "footer",
  "form",
  "label",
  "select",
  "option",
  "textarea",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
];
// List of HTML void (self-closing) elements
const voidElements = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];
export default function CreateTagForm() {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    copyToClipboard(htmlSnippet);
    setCopied(true);

    // Hide message after 1.5 seconds
    setTimeout(() => setCopied(false), 1500);
  };

  const { copyToClipboard } = useHelperFunctionStore();
  const [validParent, setValidParent] = useState(true);
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState("");
  const [selectionEnd, setSelectionEnd] = useState("");
  const [caretPosition, setCaretPosition] = useState(0);
  const [mode, setMode] = useState("create"); // "create" | "parent" | "child"
  const [htmlSnippet, setHtmlSnippet] = useState("");
  const resultRef = useRef(null);
  const [formData, setFormData] = useState({
    tag: "div",
    id: "",
    className: "",
    attributes: [{ name: "", value: "" }],
  });
  const [disable, setDisable] = useState(false);

  const [showMenu, setShowMenu] = useState(false);

  const [input, setInput] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const validateSnippet = () => {
    setResults([]);
    setError(null);

    if (!htmlSnippet.trim()) {
      setError("Please paste some HTML to validate.");
      return;
    }

    try {
      // Rules: detect unclosed tags, etc.
      const rules = { "tag-pair": true };
      const messages = HTMLHint.verify(htmlSnippet, rules);
      setResults(messages);
    } catch (err) {
      setError("Validation failed: " + err.message);
    }
  };

  const filteredTags = commonTags.filter((t) => {
    if (selectedText) {
      // Exclude tags that are in voidElements
      return !voidElements.includes(t);
    } else {
      // Show all tags normally when selectedText is false
      return t.toLowerCase().includes(formData.tag.toLowerCase());
    }
  });

  const resetForm = () => {
    setFormData((prev) => ({
      ...prev,
      id: "",
      attributes: [{ name: "", value: "" }],
    }));
  };
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAttributeChange = (index, field, value) => {
    const newAttrs = [...formData.attributes];
    newAttrs[index][field] = value;
    setFormData({ ...formData, attributes: newAttrs });
  };

  const handleAddAttribute = () => {
    setFormData({
      ...formData,
      attributes: [...formData.attributes, { name: "", value: "" }],
    });
  };

  const buildTagString = ({ tag, id, className, attributes }) => {
    const attrStrings = [];
    if (id) attrStrings.push(`id="${id}"`);
    if (className) attrStrings.push(`class="${className}"`);
    attributes.forEach(({ name, value }) => {
      if (name.trim()) attrStrings.push(`${name}="${value}"`);
    });

    if (selectedText) {
      // Otherwise → normal opening/closing tag
      return `<${tag}${attrStrings.length ? " " + attrStrings.join(" ") : ""}>`;
    } else {
      // If tag is a void element → self-close
      if (voidElements.includes(tag.toLowerCase())) {
        return `<${tag}${
          attrStrings.length ? " " + attrStrings.join(" ") : ""
        } />`;
      }

      // Otherwise → normal opening/closing tag
      return `<${tag}${
        attrStrings.length ? " " + attrStrings.join(" ") : ""
      }></${tag}>`;
    }
  };
  const handleMouseUp = (e) => {
    // Wait until mouse is released so caret is updated properly
    requestAnimationFrame(() => {
      setSelectionStart(e.target.selectionStart);
      setSelectionEnd(e.target.selectionEnd);
      // const text = e.target.value.substring(start, end);

      var start = e.target.selectionStart;
      var end = e.target.selectionEnd;
      console.log(start + " - and - " + end);
      var text = e.target.value.substring(start, end);

      setSelectedText(text);
      CheckCurrentSelectTag();
    });
  };
  const CheckCurrentSelectTag = () => {
    if (voidElements.includes(formData.tag)) {
      setDisable(true);
      setValidParent(false);
    } else {
      setDisable(false);
      setValidParent(true);
    }
  };
  const handleMouseLeave = (e) => {
    // if (!selectionStart && !selectionEnd) return false;
    requestAnimationFrame(() => {
      setSelectionStart(e.target.selectionStart);
      setSelectionEnd(e.target.selectionEnd);
      // const text = e.target.value.substring(start, end);

      var start = e.target.selectionStart;
      var end = e.target.selectionEnd;

      var text = e.target.value.substring(start, end);

      setSelectedText(text);
      CheckCurrentSelectTag();
    });
  };

  // capture caret position on mouse interaction
  const handleMouseDown = (e) => {
    // Wait until mouse is released so caret is updated properly
    requestAnimationFrame(() => {
      const pos = e.target.selectionStart;
      setCaretPosition(pos);
    });
  };
  const handleSubmit = () => {
    const { tag, id, className, attributes } = formData;
    if (!tag.trim()) return;

    const newTagString = buildTagString(formData);

    let updatedSnippet = htmlSnippet;

    if (mode === "create" || !htmlSnippet) {
      // insert tag at last known caret position
      if (selectedText) {
        var before = updatedSnippet.slice(0, selectionStart);
        var after = updatedSnippet.slice(selectionEnd);
        updatedSnippet =
          before +
          buildTagString(formData) +
          selectedText +
          `</${tag}>` +
          after;
        setSelectedText("");
        // setCaretPosition(0);
      } else if (caretPosition) {
        const start = caretPosition ?? htmlSnippet.length;
        const before = updatedSnippet.slice(0, start);
        const after = updatedSnippet.slice(start);
        updatedSnippet = before + newTagString + after;
        // setCaretPosition(0);
        setSelectedText("");
      } else {
        updatedSnippet += newTagString;
      }
    }

    const formatted = beautifyHtml(updatedSnippet, {
      indent_size: 4,
      wrap_line_length: 80,
      unformatted: [], // format everything
      content_unformatted: [], // also format inline tags
      extra_liners: [], // don't add extra line breaks
      preserve_newlines: true,
      max_preserve_newlines: 1,
      inline: [],
    });
    setHtmlSnippet(formatted);

    resetForm();
    setMode("create");
    selectedText ? setShowMenu(false) : "";
  };

  useEffect(() => {
    if (htmlSnippet && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, []);

  return (
    <div className="p-4 text-sm">
      {/* Generated HTML Section */}

      <div ref={resultRef} className="p-3 border rounded bg-white mb-3">
        <p className="font-medium mb-1">Generated HTML:</p>
        <textarea
          value={htmlSnippet}
          // hide menu on click anywhere
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onChange={(e) => {
            setHtmlSnippet(e.target.value);
          }}
          className="w-full border rounded p-2 font-mono text-xs bg-gray-100 outline-1 outline-gray-400 focus:outline-2 focus:outline-gray-500 h-20"
        ></textarea>

        <div className="flex gap-2 mt-2 justify-between">
          <div className="">
            <button
              onClick={() => {
                setSelectedText("");
                // setSelectionStart("");
                // setSelectionEnd("");
                setHtmlSnippet("");
              }}
              className="bg-green-500 text-white rounded px-2 py-1 text-xs mr-2"
            >
              Clear
            </button>
            <button
              onClick={handleCopy}
              className="relative bg-slate-700 text-white rounded px-2 py-1 text-xs"
            >
              Copy
              {copied && (
                <span className="absolute top-0 right-0 translate-x-[110%] -translate-y-[80%] text-[12px] bg-green-800 text-white p-1 rounded">
                  Copied!
                </span>
              )}
            </button>
          </div>

          <button
            onClick={validateSnippet}
            className="bg-blue-600 text-white rounded px-2 py-1 text-xs"
          >
            Validate
          </button>
        </div>

        {error && <p className="text-red-600 mt-3">⚠️ {error}</p>}

        {results.length > 0 && (
          <div className="mt-2 border rounded-lg p-3 space-y-3 bg-gray-50 ">
            <ul className="mt-3 space-y-1">
              {results.map((r, i) => (
                <li key={i} className="text-blue-800">
                  <b>{r.rule.id}</b>: {r.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.length === 0 && !error && htmlSnippet.trim() && (
          <p className="mt-3 text-green-800"> No tag errors found</p>
        )}
      </div>
      <div className="border rounded-lg p-3 space-y-3 bg-gray-50 ">
        <div className="flex gap-2 justify-between">
          <div className="w-[300px]">
            {selectedText === "" ? (
              "Create New Tag"
            ) : (
              <>
                <AlertBoxElement
                  message={
                    <>
                      Creating Parent Tag for:{" "}
                      {selectedText.length > 40
                        ? selectedText.slice(0, 40) + "..."
                        : selectedText}
                    </>
                  }
                  type="info"
                />
              </>
            )}
          </div>
          <div>
            <button
              onClick={handleSubmit}
              disabled={disable}
              className={`${
                disable ? "bg-gray-400" : "bg-yellow-400"
              }  text-black font-semibold rounded-lg px-3 py-2 cursor-pointer`}
            >
              Create Tag
            </button>
          </div>
        </div>
        <div>
          <label className="block font-medium mb-1">Tag name</label>
          {!validParent && (
            <label className="text-red-500 ">
              The selected tag is not allowed to be a parent.
            </label>
          )}
          <input
            list="html-tags"
            type="text"
            placeholder="Type or select a tag"
            value={formData.tag}
            onChange={(e) => {
              handleChange("tag", e.target.value);
              CheckCurrentSelectTag();
              if (e.target.value === "") {
                setDisable(true);
              } else {
                setDisable(false);
              }
            }}
            onClick={(e) => {
              (e.target.value = ""), handleChange("tag", e.target.value);
              if (e.target.value === "") {
                setDisable(true);
              } else {
                setDisable(false);
              }
            }} // clear to show all options
            className="w-full border p-2 rounded"
          />
          <datalist id="html-tags">
            {filteredTags.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block font-medium mb-1">ID (optional)</label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => handleChange("id", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="e.g. my-element"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Class (optional)</label>
          <input
            type="text"
            value={formData.className}
            onChange={(e) => handleChange("className", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="e.g. container main-box"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Attributes</label>
          {formData.attributes.map((attr, i) => (
            <div
              key={i}
              className="flex gap-2 mb-2 flex-wrap pb-2 border-b border-yellow-300"
            >
              <input
                type="text"
                placeholder="name (e.g. data-id)"
                value={attr.name}
                onChange={(e) =>
                  handleAttributeChange(i, "name", e.target.value)
                }
                className="flex-1 border p-2 rounded"
              />
              <input
                type="text"
                placeholder="value (e.g. 123)"
                value={attr.value}
                onChange={(e) =>
                  handleAttributeChange(i, "value", e.target.value)
                }
                className="flex-1 border p-2 rounded"
              />
            </div>
          ))}
          <button
            onClick={handleAddAttribute}
            className="text-blue-600 text-xs underline"
          >
            + Add attribute
          </button>
        </div>
      </div>
      {/* Single Unified Form */}
      {/* <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
        <p className="font-semibold capitalize">
          {mode === "create" ? "Create New Tag" : `Add ${mode} Tag`}
        </p>

        <div>
          <label className="block font-medium mb-1">Tag name</label>
          <input
            list="html-tags"
            type="text"
            placeholder="Type or select a tag"
            value={formData.tag}
            onChange={(e) => handleChange("tag", e.target.value)}
            className="w-full border p-2 rounded"
          />
          <datalist id="html-tags">
            {filteredTags.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="block font-medium mb-1">ID (optional)</label>
          <input
            type="text"
            value={formData.id}
            onChange={(e) => handleChange("id", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="e.g. my-element"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Class (optional)</label>
          <input
            type="text"
            value={formData.className}
            onChange={(e) => handleChange("className", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="e.g. container main-box"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Attributes</label>
          {formData.attributes.map((attr, i) => (
            <div
              key={i}
              className="flex gap-2 mb-2 flex-wrap pb-2 border-b border-yellow-300"
            >
              <input
                type="text"
                placeholder="name (e.g. data-id)"
                value={attr.name}
                onChange={(e) =>
                  handleAttributeChange(i, "name", e.target.value)
                }
                className="flex-1 border p-2 rounded"
              />
              <input
                type="text"
                placeholder="value (e.g. 123)"
                value={attr.value}
                onChange={(e) =>
                  handleAttributeChange(i, "value", e.target.value)
                }
                className="flex-1 border p-2 rounded"
              />
            </div>
          ))}
          <button
            onClick={handleAddAttribute}
            className="text-blue-600 text-xs underline"
          >
            + Add attribute
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleSubmit}
            className="bg-yellow-400 text-black font-semibold rounded-lg px-3 py-2 cursor-pointer"
          >
            {mode === "create"
              ? "Create Tag"
              : `Add ${mode.charAt(0).toUpperCase() + mode.slice(1)}`}
          </button>

          {mode !== "create" && (
            <button
              onClick={() => {
                setMode("create");
                resetForm();
              }}
              className="text-red-500 text-xs underline"
            >
              Cancel
            </button>
          )}
        </div>
      </div> */}
    </div>
  );
}
