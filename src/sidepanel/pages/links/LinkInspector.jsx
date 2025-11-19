// import { useEffect, useState } from "react";
// import { useHoverLinkStore } from "../../store/useHoverLinkStore.jsx";
// import { useHelperFunctionStore } from "../../store/useHelperFunctionStore.jsx";
// import {
//   CopyNotificationElement,
//   AlertBoxElement,
// } from "../../components/UI/Notification.jsx";
// export default function LinkInspector() {
//   const {
//     links,
//     setLinks,
//     resetLinks,
//     setError,
//     requestTabId,
//     setRequestTabId,
//   } = useHoverLinkStore();

//   const [isFetching, setIsFetching] = useState(false);

//   const [currentTabId, setCurrentTabId] = useState(null); // ✅ track active tab id
//   const tabMismatch =
//     requestTabId && currentTabId && requestTabId !== currentTabId;
//   const [copiedUniqueClass, setCopiedUniqueClass] = useState("");
//   const { copyToClipboard, handleFindOnPage } = useHelperFunctionStore();
//   const [copied, setCopied] = useState(false);
//   const handleCopy = (hrefLink, uniqueClass) => {
//     copyToClipboard(hrefLink);
//     setCopied(true);
//     setCopiedUniqueClass(uniqueClass);
//     // Hide message after 1.5 seconds
//     setTimeout(() => setCopied(false), 1500);
//   };
//   // 🔹 Listen for LINKS_FOUND from content script
//   useEffect(() => {
//     const handleMessage = (message) => {
//       if (message.type === "LINKS_FOUND") {
//         // if (!message.links || message.links.length === 0) {
//         //   resetLinks();
//         //   return;
//         // }

//         // Normalize + deduplicate
//         const normalize = (url) => url.toLowerCase().replace(/\/$/, "");
//         const seen = new Set();
//         const uniqueLinks = [];

//         message.links.forEach((link) => {
//           const normalized = normalize(link.href);
//           if (!seen.has(normalized)) {
//             seen.add(normalized);
//             uniqueLinks.push(link);
//           }
//         });

//         setLinks(uniqueLinks);
//       }
//     };
//     updateCurrentTab();

//     const handleTabChange = async (message) => {
//       if (message.action === "tabChanged") {
//         console.log("🔄 Tab changed, fetching new tab ID...");
//         handleStopFetch();
//         await updateCurrentTab();
//       }
//     };

//     chrome.runtime.onMessage.addListener(handleTabChange);

//     chrome.runtime.onMessage.addListener(handleMessage);

//     return () => {
//       chrome.runtime.onMessage.removeListener(handleMessage);
//       chrome.runtime.onMessage.removeListener(handleTabChange);
//     };
//   }, []);

//   // ************************* get current tab id on load & tab switch *****************************//
//   const updateCurrentTab = async () => {
//     const [tab] = await chrome.tabs.query({
//       active: true,
//       currentWindow: true,
//     });
//     if (tab?.id) setCurrentTabId(tab.id);
//   };

//   const handleFetchLinks = async () => {
//     resetLinks();
//     setIsFetching(true);
//     setError(null);

//     try {
//       const [tab] = await chrome.tabs.query({
//         active: true,
//         currentWindow: true,
//       });

//       if (!tab?.id) {
//         setError("No active tab found.");
//         setIsFetching(false);
//         return;
//       }

//       setRequestTabId(tab.id); // ✅ store tab ID

//       chrome.tabs.sendMessage(tab.id, { type: "startHovering" }, (response) => {
//         if (chrome.runtime.lastError) {
//           console.warn(
//             "Failed to send message:",
//             chrome.runtime.lastError.message
//           );
//           setError("Failed to communicate with the content script.");
//         } else {
//           console.log("Extraction executed:", response?.data);
//         }
//       });
//     } catch (err) {
//       setError("An error occurred while extracting links.");
//     }
//   };

//   // 🔹 Stop hover action
//   const stopHoveringLink = async () => {
//     try {
//       if (!requestTabId) return;
//       chrome.tabs.sendMessage(requestTabId, { type: "stopHoveringLink" });
//     } catch (error) {
//       console.error("Error in stopHoveringLink:", error);
//     }
//   };

//   const handleStopFetch = async () => {
//     await stopHoveringLink();
//     setIsFetching(false);
//   };

//   return (
//     <div className="p-3">
//       <div className="flex gap-2 mb-4 flex-col mx-2">
//         {!isFetching ? (
//           <button
//             onClick={handleFetchLinks}
//             className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium no-highlight cursor-pointer"
//           >
//             Start Hover Mode
//           </button>
//         ) : (
//           <button
//             onClick={handleStopFetch}
//             className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium no-highlight cursor-pointer"
//           >
//             Stop Hover Mode
//           </button>
//         )}
//       </div>
//       {tabMismatch && (
//         <AlertBoxElement
//           message={
//             <>
//               <span className="font-medium">Warning alert!</span> ⚠️ Looks like
//               you switched tabs! The links below are from your previous tab.
//             </>
//           }
//           type="warning"
//         />
//       )}
//       {links.length === 0 ? (
//         <p className="text-sm text-gray-500">
//           {isFetching ? "Hover your mouse on the page." : ""}
//         </p>
//       ) : (
//         <ol className="list-decimal ml-4 space-y-3">
//           {links.map((link, i) => (
//             <li key={i} id={`link-${i}`} className="mb-3">
//               <div className="flex justify-left items-center mb-2 gap-2 flex-wrap">
//                 <button
//                   onClick={() => handleFindOnPage(link.uniqueClass)}
//                   disabled={tabMismatch} // disable if tab changed
//                   className={`rounded border border-yellow-700 text-xs font-semibold py-1 px-2 ${
//                     tabMismatch
//                       ? "text-gray-400 cursor-not-allowed"
//                       : "text-slate-700 hover:bg-slate-200 cursor-pointer"
//                   }`}
//                 >
//                   Find on the page
//                 </button>

//                 <button
//                   onClick={() => handleCopy(link.href, link.uniqueClass)}
//                   className="rounded border border-yellow-700 text-xs font-semibold hover:bg-slate-200 py-1 px-2 text-slate-700 cursor-pointer"
//                 >
//                   Copy link
//                   {copiedUniqueClass === link.uniqueClass && copied && (
//                     <CopyNotificationElement />
//                   )}
//                 </button>
//               </div>

//               <a
//                 href={link.href}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="leading-none text-base break-words text-slate-600 hover:text-yellow-600"
//               >
//                 {link.href}
//               </a>
//             </li>
//           ))}
//         </ol>
//       )}
//     </div>
//   );
// }

import React from "react";
import LinkInspectorList from "../../features/linkInspectorList/LinkInspectorList.jsx";
const LinkInspector = () => {
  return (
    <div>
      <LinkInspectorList />
    </div>
  );
};

export default LinkInspector;
