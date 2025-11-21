export const copyToClipboard = (text) => {
  if (!navigator.clipboard) {
    return;
  }
  navigator.clipboard.writeText(text);
};
