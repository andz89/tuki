import { html as beautifyHtml } from "js-beautify";

export function formatHTML(htmlSnippet) {
  return beautifyHtml(htmlSnippet, {
    indent_size: 4,
    wrap_line_length: 80,
    unformatted: [], // format everything
    content_unformatted: [], // also format inline tags
    extra_liners: [], // don't add extra line breaks
    preserve_newlines: true,
    max_preserve_newlines: 1,
    inline: [],
  });
}
