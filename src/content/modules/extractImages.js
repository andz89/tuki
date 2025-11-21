export function extractImages() {
  const images = [...document.querySelectorAll("img")]
    .map((img) => img.src)
    .filter((src) => src && src.startsWith("http")); // ignore chrome extension url

  return images;
}
