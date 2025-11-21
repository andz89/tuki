import { extractLinks, locateLinkOnPage } from "./modules/links.js";
import {
  getLinksOnSelectedSection,
  mouseOut,
  mouseOver,
  removeCreatedCustomStyleAndElement,
  custom_style,
  custom_overlay,
} from "./modules/inspectingLinks.js";
// content/content.js
import { extractImages } from "./modules/extractImages";
//receive data listener::
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "ping") {
    sendResponse({ pong: true });
    return true; // to check if content script is available
  }
  if (message.type === "featuredImages") {
    const metaTags = document.querySelectorAll("meta");

    let ogImage = null;
    let twitterImage = null;

    metaTags.forEach((meta) => {
      const content = meta.getAttribute("content");
      const prop =
        meta.getAttribute("property") || meta.getAttribute("name") || "";

      if (!content) return;

      if (!ogImage && prop === "og:image") {
        ogImage = { property: "og:image", url: content };
      }

      if (!twitterImage && prop === "twitter:image") {
        twitterImage = { property: "twitter:image", url: content };
      }
    });

    //  only gets the first image found in og:image and twitter image.
    const metaImages = [ogImage, twitterImage].filter(Boolean);

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

  if (message.type === "getHyvorTalk") {
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
      innerText: el.innerText.trim().slice(0, 100), // limit text length
    }));

    sendResponse({ data: serialized });
  }

  if (message.type === "extract-links") {
    const { data } = extractLinks();

    sendResponse({ data });
  }

  if (message.type === "locateLinkOnPage") {
    const targetHref = message.targetHref;
    locateLinkOnPage(targetHref); //locate the link in the page
  }

  if (message.type === "startInspecting") {
    if (!document.querySelector("#custom-style")) {
      custom_style();
    }
    if (!document.querySelector("#custom-overlay")) {
      custom_overlay();
    }

    //  Define getLinksOnSelectedSection

    document.addEventListener("mouseover", mouseOver);
    document.addEventListener("mouseout", mouseOut);

    document.addEventListener("click", getLinksOnSelectedSection, true);
    //hover maouse on the page and get links when the user clicks on the section or page
  }
  if (message.type === "stopHoveringLink") {
    document.removeEventListener("mouseover", mouseOver);
    document.removeEventListener("mouseout", mouseOut);
    document.removeEventListener("click", getLinksOnSelectedSection, true);

    removeCreatedCustomStyleAndElement();
    chrome.runtime.sendMessage({ type: "HOVERING_STOP" });
  }
  if (message.type === "extract_images") {
    const images = extractImages();
    console.log("Extracted images in content script:", images);
    sendResponse({ images });
    return true;
  }
  return true; // keep message channel open for async if needed
});
