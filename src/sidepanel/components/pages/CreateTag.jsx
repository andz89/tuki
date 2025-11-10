import React, { useState, useRef, useEffect } from "react";
import { html as beautifyHtml } from "js-beautify";
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

export default function CreateTagForm() {
  const [mode, setMode] = useState("create"); // "create" | "parent" | "child"
  const [formData, setFormData] = useState({
    tag: "",
    id: "",
    className: "",
    attributes: [{ name: "", value: "" }],
  });
  const [htmlSnippet, setHtmlSnippet] = useState("");
  const resultRef = useRef(null);

  const filteredTags = commonTags.filter((t) =>
    t.toLowerCase().includes(formData.tag.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      tag: "",
      id: "",
      className: "",
      attributes: [{ name: "", value: "" }],
    });
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
    return `<${tag}${
      attrStrings.length ? " " + attrStrings.join(" ") : ""
    }></${tag}>`;
  };

  const handleSubmit = () => {
    const { tag } = formData;
    if (!tag.trim()) return;

    const newTagString = buildTagString(formData);

    let updatedSnippet = htmlSnippet;

    if (mode === "create" || !htmlSnippet) {
      // Normal tag creation
      updatedSnippet = newTagString;
    } else if (mode === "parent") {
      // Wrap existing HTML
      updatedSnippet = newTagString.replace(
        `></${tag}>`,
        `>${htmlSnippet}</${tag}>`
      );
    } else if (mode === "child") {
      // Insert inside
      const closingTagIndex = htmlSnippet.lastIndexOf(`</`);
      updatedSnippet =
        htmlSnippet.slice(0, closingTagIndex) +
        newTagString +
        htmlSnippet.slice(closingTagIndex);
    }

    // Beautify before displaying
    const formatted = beautifyHtml(updatedSnippet, { indent_size: 4 });
    setHtmlSnippet(formatted);

    resetForm();
    setMode("create");
  };

  useEffect(() => {
    if (htmlSnippet && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [htmlSnippet]);

  return (
    <div className="p-4 text-sm">
      {/* Generated HTML Section */}
      {htmlSnippet && (
        <div ref={resultRef} className="p-3 border rounded bg-white mb-3">
          <p className="font-medium mb-1">Generated HTML:</p>
          <textarea
            value={htmlSnippet}
            onChange={(e) =>
              setHtmlSnippet(beautifyHtml(e.target.value, { indent_size: 4 }))
            }
            className="w-full border rounded p-2 font-mono text-xs bg-gray-100 outline-1 outline-gray-400 focus:outline-2 focus:outline-gray-500 h-20"
          ></textarea>

          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setMode("parent")}
              className="bg-green-500 text-white rounded px-2 py-1 text-xs"
            >
              + Add Parent Tag
            </button>
            <button
              onClick={() => setMode("child")}
              className="bg-blue-500 text-white rounded px-2 py-1 text-xs"
            >
              + Add Child Tag
            </button>
          </div>
        </div>
      )}

      {/* Single Unified Form */}
      <div className="border rounded-lg p-3 space-y-3 bg-gray-50">
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
      </div>
    </div>
  );
}
