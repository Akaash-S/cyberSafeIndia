const u=`
  .cybersafe-indicator {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 2147483647;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 12px 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  }
  
  .cybersafe-indicator.safe {
    border-color: #10b981;
    background: #f0fdf4;
  }
  
  .cybersafe-indicator.suspicious {
    border-color: #f59e0b;
    background: #fffbeb;
  }
  
  .cybersafe-indicator.malicious {
    border-color: #ef4444;
    background: #fef2f2;
  }
  
  .cybersafe-indicator .icon {
    width: 20px;
    height: 20px;
    margin-right: 8px;
    display: inline-block;
    vertical-align: middle;
  }
  
  .cybersafe-indicator .text {
    display: inline-block;
    vertical-align: middle;
    font-weight: 500;
  }
  
  .cybersafe-indicator .close {
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: #6b7280;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .cybersafe-indicator .close:hover {
    color: #374151;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .cybersafe-warning {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #fef2f2;
    border-bottom: 2px solid #ef4444;
    padding: 12px 20px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    text-align: center;
    color: #dc2626;
    font-weight: 500;
  }
  
  .cybersafe-warning .close {
    position: absolute;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #dc2626;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`,l=document.createElement("style");l.textContent=u;document.head.appendChild(l);let r=null;function c(){console.log("CyberSafe India content script loaded"),!(window.location.href.includes("chrome-extension://")&&window.location.href.includes("blocked.html"))&&(m(),p(),v())}async function p(){try{const e=await chrome.runtime.sendMessage({action:"scanUrl",url:window.location.href});e&&!e.error&&d(e.status,e.title||"Page analyzed")}catch(e){console.error("Error checking page security:",e)}}function d(e,o){r&&r.remove(),r=document.createElement("div"),r.className=`cybersafe-indicator ${e}`;const t=h(e),n=document.createElement("button");n.className="close",n.innerHTML="×",n.onclick=()=>{r&&(r.remove(),r=null)},r.innerHTML=`
    ${t}
    <span class="text">${o}</span>
  `,r.appendChild(n),document.body.appendChild(r),e==="safe"&&setTimeout(()=>{r&&(r.remove(),r=null)},5e3)}function h(e){switch(e){case"safe":return'<svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>';case"suspicious":return'<svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>';case"malicious":return'<svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path></svg>';default:return'<svg class="icon" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>'}}function m(){b(),new MutationObserver(o=>{o.forEach(t=>{t.addedNodes.forEach(n=>{if(n.nodeType===Node.ELEMENT_NODE){const i=n;i.tagName==="A"?s(i):i.querySelectorAll("a").forEach(s)}})})}).observe(document.body,{childList:!0,subtree:!0})}function b(){document.querySelectorAll("a[href]").forEach(o=>s(o))}function s(e){const o=e.href;if(!(!o||o.startsWith("javascript:")||o.startsWith("mailto:")||o.startsWith("tel:"))){if(g(o)){e.addEventListener("click",t=>{t.preventDefault(),a(e,"This appears to be a shortened URL. Would you like to scan it first?")});return}if(y(o)){e.addEventListener("click",t=>{t.preventDefault(),a(e,"This URL looks suspicious. Would you like to scan it first?")});return}x(o)&&(e.style.borderBottom="1px dashed #f59e0b",e.title="External link - click to scan",e.addEventListener("click",t=>{t.preventDefault(),a(e,"This is an external link. Would you like to scan it first?")}))}}function g(e){const o=["bit.ly","tinyurl.com","short.link","t.co","goo.gl","ow.ly","is.gd","v.gd","shorturl.at","rebrand.ly","cutt.ly","short.cm"];try{const t=new URL(e).hostname.toLowerCase();return o.some(n=>t.includes(n))}catch{return!1}}function y(e){return[/[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/,/[a-z0-9-]+\.tk$/,/[a-z0-9-]+\.ml$/,/[a-z0-9-]+\.ga$/,/[a-z0-9-]+\.cf$/].some(t=>t.test(e.toLowerCase()))}function x(e){try{const o=new URL(e).hostname,t=window.location.hostname;return o!==t}catch{return!1}}function a(e,o){const t=document.createElement("div");t.className="cybersafe-warning",t.innerHTML=`
    ${o}
    <button class="close" onclick="this.parentElement.remove()">×</button>
  `;const n=document.createElement("button");n.textContent="Scan URL",n.style.cssText=`
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    margin-left: 12px;
    cursor: pointer;
    font-size: 14px;
  `,n.onclick=async()=>{try{const i=await chrome.runtime.sendMessage({action:"scanUrl",url:e.href});i&&!i.error&&(i.status==="safe"?window.open(e.href,"_blank"):alert(`Warning: ${i.title||"This URL may be unsafe"}`))}catch(i){console.error("Error scanning URL:",i)}t.remove()},t.appendChild(n),document.body.insertBefore(t,document.body.firstChild)}function v(){new MutationObserver(o=>{o.forEach(t=>{t.type==="childList"&&t.addedNodes.forEach(n=>{if(n.nodeType===Node.ELEMENT_NODE){const i=n;i.tagName==="A"?s(i):i.querySelectorAll("a").forEach(s)}})})}).observe(document.body,{childList:!0,subtree:!0})}function w(e){e.action==="updateSecurityStatus"?d(e.status,e.message):e.action==="showNotification"&&k(e.title,e.message,e.type)}function k(e,o,t="info"){const n=document.createElement("div");n.style.cssText=`
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${t==="error"?"#ef4444":t==="warning"?"#f59e0b":"#22c55e"};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 2147483647;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    max-width: 400px;
    text-align: center;
  `,n.innerHTML=`
    <div style="font-weight: 600; margin-bottom: 4px;">${e}</div>
    <div>${o}</div>
  `,document.body.appendChild(n),setTimeout(()=>{document.body.contains(n)&&document.body.removeChild(n)},5e3)}chrome.runtime.onMessage.addListener(w);window.addEventListener("message",e=>{e.data&&e.data.type==="CYBERSAFE_AUTH_SYNC"&&e.data.source==="cybersafe-website"&&chrome.runtime.sendMessage({action:"authSync",data:e.data.data})});document.readyState==="loading"?document.addEventListener("DOMContentLoaded",c):c();
