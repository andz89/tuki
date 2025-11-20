(function(){"use strict";const f=()=>{const e="unique-link-ID";document.querySelectorAll(`a[class*="${e}-"]`).forEach(t=>{t.classList.forEach(s=>{s.startsWith(e)&&t.classList.remove(s)})});var a=0;return{data:Array.from(document.querySelectorAll("a")).filter(t=>!t.href.endsWith("/#")&&!t.href.includes("chrome-extension")&&!t.href.includes("wp-admin")&&!t.href.includes("/edit")&&!t.href.includes("nonce")&&!t.href.includes("preview=true")&&!t.href.includes("action=delete")&&!t.href.includes("admin")).map(t=>{const s=`${e}-${a++}`;return t.classList.add(s),{href:t.href,uniqueClass:s}})}},y=(e,a=5,r=300)=>{const t=s=>{const l=Array.from(document.querySelectorAll("a")).filter(n=>n.classList.contains(e));if(document.querySelectorAll(".zigzag-highlight").forEach(n=>{n.classList.remove("zigzag-highlight"),n.style.position=""}),document.querySelectorAll(".zigzag-popup").forEach(n=>n.remove()),document.querySelectorAll(".zigzag-popup-with-parent").forEach(n=>n.remove()),l.length===0){s>0?setTimeout(()=>t(s-1),r):chrome.runtime.sendMessage({type:"link-status",status:"not-found",href:e});return}const o=l[0],i=o.getBoundingClientRect();if(i.width===0&&i.height===0){chrome.runtime.sendMessage({type:"link-status",status:"hidden",href:e});return}if(o.scrollIntoView({behavior:"smooth",block:"center"}),o.classList.add("zigzag-highlight"),getComputedStyle(o).position==="static"&&(o.style.position="relative"),o.parentNode.children.length>1){const n=document.createElement("div");n.className="zigzag-popup",n.textContent="Here’s the link",o.appendChild(n);const d=n.getBoundingClientRect();d.right>window.innerWidth&&(n.style.left=`${window.innerWidth-d.width-10}px`),d.bottom>window.innerHeight&&(n.style.top=`${i.top-d.height-4}px`)}else{const n=document.createElement("div");n.className="zigzag-popup-with-parent",n.textContent="Here’s the link",o.parentElement.appendChild(n),n.left=45,o.parentElement.className+=" zigzag-highlight"}if(chrome.runtime.sendMessage({type:"link-status",status:"highlighted",href:e}),!document.getElementById("zigzag-style")){const n=document.createElement("style");n.id="zigzag-style",n.textContent=`
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
      `,document.head.appendChild(n)}};t(a)},m=e=>{let a=0;if(e.preventDefault(),e.stopPropagation(),e.target.closest("[data-extension-panel]"))return;const r=e.target,t="unique-link-ID",s=new Set,c=r.closest("a");c&&s.add(c),r.querySelectorAll("a").forEach(o=>s.add(o));const l=Array.from(s).filter(o=>{try{const i=new URL(o.href);return["http:","https:","mailto:","sms:","tg:","whatsapp:"].includes(i.protocol)&&!i.href.startsWith("chrome-extension://")&&!i.href.includes("/wp-admin")&&!i.href.includes("/edit")&&!i.href.includes("nonce")&&!i.href.includes("preview=true")&&!i.href.includes("action=delete")}catch{return!1}}).map(o=>{const i=[...o.classList].find(g=>g.startsWith(t)),u=i||`${t}-${a++}`;return i||o.classList.add(u),console.log(o.href),{href:o.href,uniqueClass:u}});chrome.runtime.sendMessage({type:"LINKS_FOUND",links:l})},v=()=>{var e=document.createElement("div");e.id="custom-overlay",e.style.position="fixed",e.style.top="0",e.style.left="0",e.style.width="100%",e.style.height="100%",e.style.zIndex="999999",e.style.cursor="crosshair",e.style.backgroundColor="transparent",e.style.pointerEvents="none",document.body.appendChild(e)},x=()=>{var e=document.createElement("style");e.id="custom-style",e.textContent=`
    .__hover-highlight {
      outline: 1px dashed purple ;
      background-color: rgba(0, 128, 0, 0.2) ;
     cursor: crosshair;
    }
  `,document.head.append(e)},h=e=>{var a;const r=document.elementFromPoint(e.clientX,e.clientY);!r||r===a||(a&&a.classList.remove("__hover-highlight"),r.classList.add("__hover-highlight"),a=r)},p=e=>{e.target.classList.remove("__hover-highlight")},z=()=>{document.querySelectorAll(".__hover-highlight").forEach(t=>{t.classList.remove("__hover-highlight")});var e=document.getElementById("custom-style");e&&e.remove();var a=document.getElementById("custom-overlay");a&&a.remove(),document.querySelectorAll(".zigzag-highlight").forEach(t=>{t.classList.remove("zigzag-highlight")}),document.querySelectorAll(".zigzag-popup").forEach(t=>t.remove());var r=document.getElementById("custom-pupop");r&&r.remove()};chrome.runtime.onMessage.addListener((e,a,r)=>{if(e.type==="ping")return r({pong:!0}),!0;if(e.type==="featuredImages"){const t=document.querySelectorAll("meta"),s=["parallax","background","banner","header","user"],c=Array.from(t).map(l=>{const o=l.getAttribute("content"),i=l.getAttribute("property")||l.getAttribute("name")||"";return o&&(i==="og:image"||i==="twitter:image")&&!s.some(u=>o.toLowerCase().includes(u))?{property:i,url:o}:null}).filter(l=>l!==null);r({data:c})}if(e.type==="getPageInfo"){const t=document.querySelector('meta[name="description"]'),s=t?t.content:null,c=document.documentElement.lang||null,l=document.querySelector('link[rel="canonical"]'),o=l?l.href:null,i=document.title||null;r({description:s,lang:c,canonical:o,title:i})}if(e.type==="getCustomTag"){const t=document.querySelector("hyvor-talk-comments");if(!t){r({data:[]});return}const s=[{tagName:t.tagName,attributes:Array.from(t.attributes).map(c=>({name:c.name,value:c.value}))}];r({data:s})}if(e.type==="getCategoryElements"){const s=Array.from(document.querySelectorAll("article")).filter(c=>Array.from(c.classList).some(l=>l.includes("category"))).map(c=>({tagName:c.tagName,classes:Array.from(c.classList),attributes:Array.from(c.attributes).map(l=>({name:l.name,value:l.value})),innerText:c.innerText.trim().slice(0,100)}));r({data:s})}if(e.type==="extract-links"){const{data:t}=f();r({data:t})}if(e.type==="locateLinkOnPage"){const t=e.targetHref;y(t)}return e.type==="startInspecting"&&(document.querySelector("#custom-style")||x(),document.querySelector("#custom-overlay")||v(),document.addEventListener("mouseover",h),document.addEventListener("mouseout",p),document.addEventListener("click",m,!0)),e.type==="stopHoveringLink"&&(document.removeEventListener("mouseover",h),document.removeEventListener("mouseout",p),document.removeEventListener("click",m,!0),z(),chrome.runtime.sendMessage({type:"HOVERING_STOP"})),!0})})();
