export const copyToClipboard = (text) => {
  if (!navigator.clipboard) {
    console.warn("Clipboard API not supported");
    return;
  }
  navigator.clipboard.writeText(text).then(() => {
    console.log(`Copied to clipboard: ${text}`);
  });
};
