export const extractLinks = () => {
  const uniquePrefix = "unique-link-ID";

  // ✅ Remove all previously assigned unique-link-ID-* classes
  document.querySelectorAll(`a[class*="${uniquePrefix}-"]`).forEach((a) => {
    a.classList.forEach((cls) => {
      if (cls.startsWith(uniquePrefix)) a.classList.remove(cls);
    });
  });

  // ✅ Assign new unique IDs
  var counter = 0;
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

  return { data: linksWithClasses };
};
export const locateLinkOnPage = (targetHref, retries = 5, delay = 300) => {
  const attemptFind = (remainingRetries) => {
    const links = Array.from(document.querySelectorAll("a"));
    const matchingLinks = links.filter((link) =>
      link.classList.contains(targetHref)
    );

    // Remove existing highlights, popups, and zigzag-popup-with-parent elements before creating new ones
    document.querySelectorAll(".zigzag-highlight").forEach((el) => {
      el.classList.remove("zigzag-highlight");
      el.style.position = "";
    });
    document.querySelectorAll(".zigzag-popup").forEach((el) => el.remove());
    document
      .querySelectorAll(".zigzag-popup-with-parent")
      .forEach((el) => el.remove());
    //---------------

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
    link.classList.add("zigzag-highlight");
    if (getComputedStyle(link).position === "static") {
      link.style.position = "relative";
    }
    const hasSiblings = link.parentNode.children.length > 1;

    if (hasSiblings) {
      // Highlight link

      // Create popup as a sibling
      const popup = document.createElement("div");
      popup.className = "zigzag-popup";
      popup.textContent = "Here’s the link";

      // Insert after the link
      link.appendChild(popup);

      // Get link position

      const popupRect = popup.getBoundingClientRect();

      // Adjust position if offscreen
      if (popupRect.right > window.innerWidth) {
        popup.style.left = `${window.innerWidth - popupRect.width - 10}px`;
      }
      if (popupRect.bottom > window.innerHeight) {
        popup.style.top = `${rect.top - popupRect.height - 4}px`;
      }
    } else {
      // If the <a> tag has no siblings, apply the highlight zigzag style to the <a> tag’s parent element

      const popup = document.createElement("div");
      popup.className = "zigzag-popup-with-parent";
      popup.textContent = "Here’s the link";
      link.parentElement.appendChild(popup);

      popup.left = +"45";
      link.parentElement.className += " zigzag-highlight";
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
        .zigzag-popup-with-parent {
          position: absolute;
          background: rgb(252, 198, 0);
          color: black;
          padding: 4px 8px;
         
          font-size: 12px;
          z-index: 99999;
          white-space: nowrap;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          top: 100%;
          left: 50%;
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
};
