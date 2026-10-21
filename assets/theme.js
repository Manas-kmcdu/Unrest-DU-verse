/* theme: runs before first paint so there is no flash of the wrong theme */
(function(){var d=document.documentElement,K="unrest-theme",mq=matchMedia("(prefers-color-scheme: light)");
function saved(){try{var t=localStorage.getItem(K);return t==="light"||t==="dark"?t:null}catch(e){return null}}
function apply(t){d.setAttribute("data-theme",t);var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",t==="light"?"#FAFAF8":"#0B0B0C")}
window.unrestTheme={get:function(){return d.getAttribute("data-theme")},set:function(t,keep){apply(t);if(keep)try{localStorage.setItem(K,t)}catch(e){}}};
apply(saved()||(mq.matches?"light":"dark"));
(mq.addEventListener?mq.addEventListener.bind(mq,"change"):mq.addListener.bind(mq))(function(e){if(!saved())apply(e.matches?"light":"dark")})})();
/* <un-logo>: the one logo component. Attrs: variant="light-on-dark|dark-on-light" (default follows text colour), size="1.6rem" */
(function(){var SX=.8,F='"Times New Roman MT Condensed","Times New Roman MT","Times New Roman",Times,"Liberation Serif",serif',d=document.documentElement,cond=false,w=2.6;
try{var c=document.createElement("canvas").getContext("2d"),s="Unrest Wmi";c.font="100px monospace";var a=c.measureText(s).width;c.font='100px "Times New Roman MT Condensed",monospace';cond=c.measureText(s).width!==a;
c.font="100px "+F;var u=c.measureText("Un").width;c.font="italic 100px "+F;w=(u+c.measureText("rest").width)/100-.12}catch(e){}
d.style.setProperty("--logo-sx",cond?1:SX);d.style.setProperty("--logo-w",w);
customElements.define("un-logo",class extends HTMLElement{
static get observedAttributes(){return["variant","size"]}
connectedCallback(){this.r()}attributeChangedCallback(){if(this.isConnected)this.r()}
r(){this.setAttribute("role","img");this.setAttribute("aria-label","unrest");this.dataset.variant=this.getAttribute("variant")||"auto";var z=this.getAttribute("size");if(z)this.style.fontSize=z;
this.innerHTML='<span class="ul-in" aria-hidden="true"><span class="ul-u">Un</span><span class="ul-r">rest</span></span>'}})})();

/* theme toggle button (#tg), shared by every page */
document.addEventListener("DOMContentLoaded",function(){var b=document.getElementById("tg");if(!b)return;function sync(){b.setAttribute("aria-label","Switch to "+(unrestTheme.get()==="light"?"dark":"light")+" theme")}
b.addEventListener("click",function(){unrestTheme.set(unrestTheme.get()==="light"?"dark":"light",true);sync()});sync();new MutationObserver(sync).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]})});
