(function(){"use strict";const f=()=>{const e="unique-link-ID";document.querySelectorAll(`a[class*="${e}-"]`).forEach(t=>{t.classList.forEach(s=>{s.startsWith(e)&&t.classList.remove(s)})});var l=0;return{data:Array.from(document.querySelectorAll("a")).filter(t=>!t.href.endsWith("/#")&&!t.href.includes("chrome-extension")&&!t.href.includes("wp-admin")&&!t.href.includes("/edit")&&!t.href.includes("nonce")&&!t.href.includes("preview=true")&&!t.href.includes("action=delete")&&!t.href.includes("admin")).map(t=>{const s=`${e}-${l++}`;return t.classList.add(s),{href:t.href,uniqueClass:s}})}},y=(e,l=5,r=300)=>{const t=s=>{const c=Array.from(document.querySelectorAll("a")).filter(o=>o.classList.contains(e));if(document.querySelectorAll(".zigzag-highlight").forEach(o=>{o.classList.remove("zigzag-highlight"),o.style.position=""}),document.querySelectorAll(".zigzag-popup").forEach(o=>o.remove()),document.querySelectorAll(".zigzag-popup-with-parent").forEach(o=>o.remove()),c.length===0){s>0?setTimeout(()=>t(s-1),r):chrome.runtime.sendMessage({type:"link-status",status:"not-found",href:e});return}const n=c[0],i=n.getBoundingClientRect();if(i.width===0&&i.height===0){chrome.runtime.sendMessage({type:"link-status",status:"hidden",href:e});return}if(n.scrollIntoView({behavior:"smooth",block:"center"}),n.classList.add("zigzag-highlight"),getComputedStyle(n).position==="static"&&(n.style.position="relative"),n.parentNode.children.length>1){const o=document.createElement("div");o.className="zigzag-popup",o.textContent="Here’s the link",n.appendChild(o);const d=o.getBoundingClientRect();d.right>window.innerWidth&&(o.style.left=`${window.innerWidth-d.width-10}px`),d.bottom>window.innerHeight&&(o.style.top=`${i.top-d.height-4}px`)}else{const o=document.createElement("div");o.className="zigzag-popup-with-parent",o.textContent="Here’s the link",n.parentElement.appendChild(o),o.left=45,n.parentElement.className+=" zigzag-highlight"}if(chrome.runtime.sendMessage({type:"link-status",status:"highlighted",href:e}),!document.getElementById("zigzag-style")){const o=document.createElement("style");o.id="zigzag-style",o.textContent=`
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
      `,document.head.appendChild(o)}};t(l)},m=e=>{let l=0;if(e.preventDefault(),e.stopPropagation(),e.target.closest("[data-extension-panel]"))return;const r=e.target,t="unique-link-ID",s=new Set,a=r.closest("a");a&&s.add(a),r.querySelectorAll("a").forEach(n=>s.add(n));const c=Array.from(s).filter(n=>{try{const i=new URL(n.href);return["http:","https:","mailto:","sms:","tg:","whatsapp:"].includes(i.protocol)&&!i.href.startsWith("chrome-extension://")&&!i.href.includes("/wp-admin")&&!i.href.includes("/edit")&&!i.href.includes("nonce")&&!i.href.includes("preview=true")&&!i.href.includes("action=delete")}catch{return!1}}).map(n=>{const i=[...n.classList].find(g=>g.startsWith(t)),u=i||`${t}-${l++}`;return i||n.classList.add(u),console.log(n.href),{href:n.href,uniqueClass:u}});chrome.runtime.sendMessage({type:"LINKS_FOUND",links:c})},v=()=>{var e=document.createElement("div");e.id="custom-overlay",e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.width="100%",e.style.height="100%",e.style.zIndex="999999",e.style.cursor="crosshair",e.style.backgroundColor="transparent",e.style.pointerEvents="none",document.body.appendChild(e)},x=()=>{var e=document.createElement("style");e.id="custom-style",e.textContent=`
    .__hover-highlight {
      outline: 1px dashed purple ;
      background-color: rgba(0, 128, 0, 0.2) ;
     cursor: crosshair;
    }
  `,document.head.append(e)},h=e=>{var l;const r=document.elementFromPoint(e.clientX,e.clientY);!r||r===l||(l&&l.classList.remove("__hover-highlight"),r.classList.add("__hover-highlight"),l=r)},p=e=>{e.target.classList.remove("__hover-highlight")},z=()=>{document.querySelectorAll(".__hover-highlight").forEach(t=>{t.classList.remove("__hover-highlight")});var e=document.getElementById("custom-style");e&&e.remove();var l=document.getElementById("custom-overlay");l&&l.remove(),document.querySelectorAll(".zigzag-highlight").forEach(t=>{t.classList.remove("zigzag-highlight")}),document.querySelectorAll(".zigzag-popup").forEach(t=>t.remove());var r=document.getElementById("custom-pupop");r&&r.remove()};function b(){return[...document.querySelectorAll("img")].map(l=>l.src).filter(l=>l&&l.startsWith("http"))}chrome.runtime.onMessage.addListener((e,l,r)=>{if(e.type==="ping")return r({pong:!0}),!0;if(e.type==="featuredImages"){const t=document.querySelectorAll("meta"),s=["parallax","background","banner","header","user"],a=Array.from(t).map(c=>{const n=c.getAttribute("content"),i=c.getAttribute("property")||c.getAttribute("name")||"";return n&&(i==="og:image"||i==="twitter:image")&&!s.some(u=>n.toLowerCase().includes(u))?{property:i,url:n}:null}).filter(c=>c!==null);r({data:a})}if(e.type==="getPageInfo"){const t=document.querySelector('meta[name="description"]'),s=t?t.content:null,a=document.documentElement.lang||null,c=document.querySelector('link[rel="canonical"]'),n=c?c.href:null,i=document.title||null;r({description:s,lang:a,canonical:n,title:i})}if(e.type==="getCustomTag"){const t=document.querySelector("hyvor-talk-comments");if(!t){r({data:[]});return}const s=[{tagName:t.tagName,attributes:Array.from(t.attributes).map(a=>({name:a.name,value:a.value}))}];r({data:s})}if(e.type==="getCategoryElements"){const s=Array.from(document.querySelectorAll("article")).filter(a=>Array.from(a.classList).some(c=>c.includes("category"))).map(a=>({tagName:a.tagName,classes:Array.from(a.classList),attributes:Array.from(a.attributes).map(c=>({name:c.name,value:c.value})),innerText:a.innerText.trim().slice(0,100)}));r({data:s})}if(e.type==="extract-links"){const{data:t}=f();r({data:t})}if(e.type==="locateLinkOnPage"){const t=e.targetHref;y(t)}if(e.type==="startInspecting"&&(document.querySelector("#custom-style")||x(),document.querySelector("#custom-overlay")||v(),document.addEventListener("mouseover",h),document.addEventListener("mouseout",p),document.addEventListener("click",m,!0)),e.type==="stopHoveringLink"&&(document.removeEventListener("mouseover",h),document.removeEventListener("mouseout",p),document.removeEventListener("click",m,!0),z(),chrome.runtime.sendMessage({type:"HOVERING_STOP"})),e.type==="extract_images"){const t=b();return console.log("Extracted images in content script:",t),r({images:t}),!0}return!0})})();
