export const getLinksOnSelectedSection = (e) => {
  var lastHighlighted;
  let counter = 0;
  e.preventDefault();
  e.stopPropagation();

  if (e.target.closest("[data-extension-panel]")) return;

  if (lastHighlighted) lastHighlighted.classList.remove("__hover-highlight");

  const selectedElement = e.target;
  const uniquePrefix = "unique-link-ID";

  const aElements = new Set();

  // Check if the clicked element or any of its ancestors is an <a>
  const maybeSelfA = selectedElement.closest("a");
  if (maybeSelfA) {
    aElements.add(maybeSelfA);
  }

  // Then add all child <a> elements inside the selected element
  selectedElement.querySelectorAll("a").forEach((a) => aElements.add(a));

  const links = Array.from(aElements)
    .filter((a) => {
      try {
        const url = new URL(a.href);
        const allowedProtocols = [
          "http:",
          "https:",
          "mailto:",
          "sms:",
          "tg:",
          "whatsapp:",
        ];
        return (
          allowedProtocols.includes(url.protocol) &&
          !url.href.startsWith("chrome-extension://") &&
          !url.href.includes("/wp-admin") &&
          !url.href.includes("/edit") &&
          !url.href.includes("nonce") &&
          !url.href.includes("preview=true") &&
          !url.href.includes("action=delete")
        );
      } catch (err) {
        return false;
      }
    })
    .map((a) => {
      const existing = [...a.classList].find((cls) =>
        cls.startsWith(uniquePrefix)
      );
      const uniqueClass = existing || `${uniquePrefix}-${counter++}`;
      if (!existing) a.classList.add(uniqueClass);

      return {
        href: a.href,
        uniqueClass,
      };
    });

  chrome.runtime.sendMessage({ type: "LINKS_FOUND", links });
};
export const custom_overlay = () => {
  //inspect:: Create the full-screen invisible layer
  var overlay = document.createElement("div");
  overlay.id = "custom-overlay";
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100%";
  overlay.style.height = "100%";
  overlay.style.zIndex = "999999";
  overlay.style.cursor = "crosshair";
  overlay.style.backgroundColor = "transparent";
  overlay.style.pointerEvents = "none"; // Make it fully click-through
  document.body.appendChild(overlay);
};

export const custom_style = () => {
  //inspect:: Add temporary highlight style
  var style = document.createElement("style");
  style.id = "custom-style";
  style.textContent = `
    .__hover-highlight {
      outline: 1px dashed purple ;
      background-color: rgba(0, 128, 0, 0.2) ;
     cursor: crosshair;
    }
  `;
  document.head.append(style);
};
export const mouseOver = (e) => {
  var lastHighlighted;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el === lastHighlighted) return;

  if (lastHighlighted) lastHighlighted.classList.remove("__hover-highlight");
  el.classList.add("__hover-highlight");
  lastHighlighted = el;
};

export const mouseOut = (e) => {
  e.target.classList.remove("__hover-highlight");
};

export const removeCreatedCustomStyleAndElement = () => {
  // Remove highlights, overlays, listeners,
  document.querySelectorAll(".__hover-highlight").forEach((el) => {
    el.classList.remove("__hover-highlight");
  });
  var style = document.getElementById("custom-style");
  if (style) style.remove();

  var overlay = document.getElementById("custom-overlay");
  if (overlay) overlay.remove();

  document.querySelectorAll(".zigzag-highlight").forEach((el) => {
    el.classList.remove("zigzag-highlight");
  });
  document.querySelectorAll(".zigzag-popup").forEach((el) => el.remove());

  document
    .querySelectorAll(".zigzag-popup-with-parent")
    .forEach((el) => el.remove());
};
