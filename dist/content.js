chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ping") {
    sendResponse({ pong: true });
    return true; // keeps sendResponse valid asynchronously
  }
});

//receive data listener::
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getMetaData") {
    const metaTags = document.querySelectorAll("meta");

    const excludeKeywords = [
      "parallax",
      "background",
      "banner",
      "header",
      "user",
    ];

    const metaImages = Array.from(metaTags)
      .map((meta) => {
        const content = meta.getAttribute("content");
        const prop =
          meta.getAttribute("property") || meta.getAttribute("name") || "";

        if (
          content &&
          (prop === "og:image" || prop === "twitter:image") &&
          !excludeKeywords.some((word) => content.toLowerCase().includes(word))
        ) {
          return { property: prop, url: content };
        }

        return null;
      })
      .filter((item) => item !== null);

    sendResponse({ data: metaImages });
  }

  if (message.type === "getPageInfo") {
    // Get description meta tag content
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const description = descriptionMeta ? descriptionMeta.content : null;

    // Get language attribute from <html>
    const lang = document.documentElement.lang || null;

    // Get canonical link
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const canonical = canonicalLink ? canonicalLink.href : null;
    // Get page title
    const title = document.title || null;

    sendResponse({ description, lang, canonical, title });
  }

  if (message.type === "getCustomTag") {
    const customElement = document.querySelector("hyvor-talk-comments");

    if (!customElement) {
      sendResponse({ data: [] });
      return;
    }

    const serialized = [
      {
        tagName: customElement.tagName,
        attributes: Array.from(customElement.attributes).map((attr) => ({
          name: attr.name,
          value: attr.value,
        })),
      },
    ];

    sendResponse({ data: serialized });
  }

  if (message.type === "getCategoryElements") {
    // Get all elements on the page
    const categoryElements = Array.from(
      document.querySelectorAll("article")
    ).filter((el) =>
      Array.from(el.classList).some((cls) => cls.includes("category"))
    );

    const serialized = categoryElements.map((el) => ({
      tagName: el.tagName,
      classes: Array.from(el.classList), // all classes of the element
      attributes: Array.from(el.attributes).map((attr) => ({
        name: attr.name,
        value: attr.value,
      })),
      innerText: el.innerText.trim().slice(0, 100), // optional preview (limit text length)
    }));

    sendResponse({ data: serialized });
  }

  if (message.type === "extract-links") {
    const uniquePrefix = "unique-link-ID";

    // ✅ Remove all previously assigned unique-link-ID-* classes
    document.querySelectorAll(`a[class*="${uniquePrefix}-"]`).forEach((a) => {
      a.classList.forEach((cls) => {
        if (cls.startsWith(uniquePrefix)) a.classList.remove(cls);
      });
    });

    // ✅ Assign new unique IDs
    let counter = 0;
    const linksWithClasses = Array.from(document.querySelectorAll("a"))
      .filter(
        (a) =>
          !a.href.endsWith("/#") &&
          !a.href.includes("chrome-extension") &&
          !a.href.includes("wp-admin") &&
          !a.href.includes("/edit") &&
          !a.href.includes("nonce") &&
          !a.href.includes("preview=true") &&
          !a.href.includes("action=delete") &&
          !a.href.includes("admin")
      )
      .map((a) => {
        const uniqueClass = `${uniquePrefix}-${counter++}`;
        a.classList.add(uniqueClass);
        return { href: a.href, uniqueClass };
      });

    sendResponse({ data: linksWithClasses });
  }

  if (message.type === "window-displayLink") {
    const targetHref = message.targetHref; // Get the href/link value
    console.log("Looking for link:", targetHref);
    displayLink(targetHref); // Use it however you need
  }

  if (message.type === "selectElementAndExtractLinks") {
    selectElementAndExtractLinks();
  }
  if (message.type === "stopHoveringLink") {
    document.removeEventListener("mouseover", mouseOver);
    document.removeEventListener("mouseout", mouseOut);
    document.removeEventListener("click", clickListener, true);

    removeCreatedCustomSyleAndElement();
    chrome.runtime.sendMessage({ type: "HOVERING_STOP" });
  }
  return true; // keep message channel open for async if needed
});

function displayLink(targetHref, retries = 5, delay = 300) {
  const attemptFind = (remainingRetries) => {
    const links = Array.from(document.querySelectorAll("a"));
    const matchingLinks = links.filter((link) =>
      link.classList.contains(targetHref)
    );

    // Remove old highlights and popups
    document.querySelectorAll(".zigzag-highlight").forEach((el) => {
      el.classList.remove("zigzag-highlight");
      el.style.position = "";
    });
    document.querySelectorAll(".zigzag-popup").forEach((el) => el.remove());

    if (matchingLinks.length === 0) {
      if (remainingRetries > 0) {
        // Retry after a short delay (for lazy-loaded content)
        setTimeout(() => attemptFind(remainingRetries - 1), delay);
      } else {
        // Could not find link
        chrome.runtime.sendMessage({
          type: "link-status",
          status: "not-found",
          href: targetHref,
        });
      }
      return;
    }

    const link = matchingLinks[0];
    const rect = link.getBoundingClientRect();
    const isHidden = rect.width === 0 && rect.height === 0;

    if (isHidden) {
      chrome.runtime.sendMessage({
        type: "link-status",
        status: "hidden",
        href: targetHref,
      });
      return;
    }

    // Scroll into view
    link.scrollIntoView({ behavior: "smooth", block: "center" });

    // Highlight link
    link.classList.add("zigzag-highlight");
    if (getComputedStyle(link).position === "static") {
      link.style.position = "relative";
    }

    // Create popup
    const popup = document.createElement("div");
    popup.className = "zigzag-popup";
    popup.textContent = "Here’s the link";
    link.appendChild(popup);

    // Adjust popup position if offscreen
    const popupRect = popup.getBoundingClientRect();
    if (popupRect.right > window.innerWidth) {
      popup.style.left = `${
        window.innerWidth - popupRect.width - rect.left - 10
      }px`;
    }
    if (popupRect.bottom > window.innerHeight) {
      popup.style.top = `-${popupRect.height + 4}px`;
    }

    chrome.runtime.sendMessage({
      type: "link-status",
      status: "highlighted",
      href: targetHref,
    });

    // Inject styles once
    if (!document.getElementById("zigzag-style")) {
      const style = document.createElement("style");
      style.id = "zigzag-style";
      style.textContent = `
        .zigzag-popup {
          position: absolute;
          background: rgb(252, 198, 0);
          color: black;
          padding: 4px 8px;
         
          font-size: 12px;
          z-index: 99999;
          white-space: nowrap;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          top: 100%;
          left: -45px;
          margin-top: 4px;
        }
        .zigzag-highlight {
          border: 3px dashed red;
          animation: pulse-border 1s infinite;
          z-index: 99999;
          background-color: rgba(255, 255, 0, 0.2);
        }
        @keyframes pulse-border {
          0% { border-color: red; }
          50% { border-color: orange; }
          100% { border-color: red; }
        }
      `;
      document.head.appendChild(style);
    }
  };

  attemptFind(retries);
}
var lastHighlighted;
function selectElementAndExtractLinks() {
  if (!document.querySelector("#custom-style")) {
    custom_style();
  }
  if (!document.querySelector("#custom-overlay")) {
    custom_overlay();
  }

  // ✅ Define clickListener as a global/window-scoped function

  document.addEventListener("mouseover", mouseOver);
  document.addEventListener("mouseout", mouseOut);

  document.addEventListener("click", clickListener, true);
}
function clickListener(e) {
  let counter = 0;
  e.preventDefault();
  e.stopPropagation();

  if (e.target.closest("[data-extension-panel]")) return;

  if (lastHighlighted) lastHighlighted.classList.remove("__hover-highlight");

  const selectedElement = e.target;
  const uniquePrefix = "unique-link-ID";

  const aElements = new Set();

  // ✅ Check if the clicked element OR any of its ancestors is an <a>
  const maybeSelfA = selectedElement.closest("a");
  if (maybeSelfA) {
    aElements.add(maybeSelfA);
  }

  // ✅ Then add all child <a> elements inside the selected element
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
      console.log(a.href);
      return {
        href: a.href,
        uniqueClass,
      };
    });

  chrome.runtime.sendMessage({ type: "LINKS_FOUND", links });
}

function custom_overlay() {
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
}

function custom_style() {
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
}
function mouseOver(e) {
  const el = document.elementFromPoint(e.clientX, e.clientY);
  if (!el || el === lastHighlighted) return;

  if (lastHighlighted) lastHighlighted.classList.remove("__hover-highlight");
  el.classList.add("__hover-highlight");
  lastHighlighted = el;
}

function mouseOut(e) {
  e.target.classList.remove("__hover-highlight");
}

function removeCreatedCustomSyleAndElement() {
  // Remove highlights, overlays, listeners, etc.
  document.querySelectorAll(".__hover-highlight").forEach((el) => {
    el.classList.remove("__hover-highlight");
  });
  var style = document.getElementById("custom-style");
  if (style) style.remove();
  // Example: remove overlay
  var overlay = document.getElementById("custom-overlay");
  if (overlay) overlay.remove();

  document.querySelectorAll(".zigzag-highlight").forEach((el) => {
    el.classList.remove("zigzag-highlight");
  });
  document.querySelectorAll(".zigzag-popup").forEach((el) => el.remove());
  // var custom_pupop = document.getElementById("custom-pupop");
  if (custom_pupop) custom_pupop.remove();
}
