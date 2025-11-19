export function buildTagString(
  { tag, id, className, attributes },
  selectedText,
  voidElements
) {
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
}
