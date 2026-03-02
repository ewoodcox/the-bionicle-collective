globalThis.process ??= {}; globalThis.process.env ??= {};
import { v as decodeKey } from './chunks/astro/server_mRoXt1Mp.mjs';
import './chunks/astro-designed-error-pages_DtIjb_q6.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_DctiQLGV.mjs';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/ethanwoodcox/Library/Mobile%20Documents/com%7Eapple%7ECloudDocs/Development/the-bionicle-collective/","cacheDir":"file:///Users/ethanwoodcox/Library/Mobile%20Documents/com%7Eapple%7ECloudDocs/Development/the-bionicle-collective/node_modules/.astro/","outDir":"file:///Users/ethanwoodcox/Library/Mobile%20Documents/com%7Eapple%7ECloudDocs/Development/the-bionicle-collective/dist/","srcDir":"file:///Users/ethanwoodcox/Library/Mobile%20Documents/com%7Eapple%7ECloudDocs/Development/the-bionicle-collective/src/","publicDir":"file:///Users/ethanwoodcox/Library/Mobile%20Documents/com%7Eapple%7ECloudDocs/Development/the-bionicle-collective/public/","buildClientDir":"file:///Users/ethanwoodcox/Library/Mobile%20Documents/com%7Eapple%7ECloudDocs/Development/the-bionicle-collective/dist/","buildServerDir":"file:///Users/ethanwoodcox/Library/Mobile%20Documents/com%7Eapple%7ECloudDocs/Development/the-bionicle-collective/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/login","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/login\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/login.ts","pathname":"/api/admin/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/collection/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/collection\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"collection","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/collection/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_id_.KwPJqKac.css"}],"routeData":{"route":"/collection/[id]","isIndex":false,"type":"page","pattern":"^\\/collection\\/([^/]+?)\\/?$","segments":[[{"content":"collection","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/collection/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_id_.KwPJqKac.css"}],"routeData":{"route":"/collection","isIndex":true,"type":"page","pattern":"^\\/collection\\/?$","segments":[[{"content":"collection","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/collection/index.astro","pathname":"/collection","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_id_.KwPJqKac.css"}],"routeData":{"route":"/login","isIndex":false,"type":"page","pattern":"^\\/login\\/?$","segments":[[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/login.astro","pathname":"/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_id_.KwPJqKac.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://thebioniclecollective.example.com","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/pages/collection/[id].astro",{"propagation":"none","containsHead":true}],["/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/pages/collection/index.astro",{"propagation":"none","containsHead":true}],["/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/pages/login.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/admin/login@_@ts":"pages/api/admin/login.astro.mjs","\u0000@astro-page:src/pages/collection/[id]@_@astro":"pages/collection/_id_.astro.mjs","\u0000@astro-page:src/pages/collection/index@_@astro":"pages/collection.astro.mjs","\u0000@astro-page:src/pages/login@_@astro":"pages/login.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/api/collection/[id]@_@ts":"pages/api/collection/_id_.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_rk1XsYHO.mjs","/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs":"chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_B3Cmw7UJ.mjs","/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/node_modules/@smithy/core/dist-es/submodules/event-streams/index.js":"chunks/index_C-1vXZgz.mjs","/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/pages/collection/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.DgT5TOWN.js","/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/pages/login.astro?astro&type=script&index=0&lang.ts":"_astro/login.astro_astro_type_script_index_0_lang.BsmVYlI1.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/pages/collection/index.astro?astro&type=script&index=0&lang.ts","(function(){const A=new URLSearchParams(window.location.search),f=A.get(\"gen\"),c=document.querySelectorAll(\".generation-tab[data-group-id]\");if(c.length){let n=function(a,o=!0){if(c.forEach(t=>{const r=t.getAttribute(\"data-group-id\")===a;t.setAttribute(\"aria-selected\",r?\"true\":\"false\")}),u.forEach(t=>{t.setAttribute(\"data-active\",t.getAttribute(\"data-group-id\")===a?\"true\":\"false\")}),o&&i.includes(a)){const t=new URL(window.location.href);t.searchParams.set(\"gen\",a);const e=document.querySelector('.collection-section[data-active=\"true\"]')?.querySelector(\".year-carousel\"),l=e?.querySelector(\"button[data-year]\")?.getAttribute(\"data-year\");if(l){t.searchParams.set(\"year\",l);const p=e.getAttribute(\"data-group-id\");if(p){const h=e.querySelectorAll(\"button[data-year]\"),m=document.querySelectorAll(`.year-pane[data-group-id=\"${p}\"]`);h.forEach(s=>{const b=s.getAttribute(\"data-year\")===l;s.setAttribute(\"aria-selected\",b?\"true\":\"false\"),s.setAttribute(\"aria-pressed\",b?\"true\":\"false\")}),m.forEach(s=>{s.setAttribute(\"data-active\",s.getAttribute(\"data-year\")===l?\"true\":\"false\")})}}else t.searchParams.delete(\"year\");window.history.replaceState({},\"\",t.toString())}};const u=document.querySelectorAll(\".collection-section[data-group-id]\"),i=Array.from(c).map(a=>a.getAttribute(\"data-group-id\")).filter(Boolean);let d=f&&i.includes(f)?f:c[0].getAttribute(\"data-group-id\")||i[0];d&&n(d,!1),c.forEach(a=>{a.addEventListener(\"click\",()=>{const o=a.getAttribute(\"data-group-id\");o&&n(o)})})}const g=A.get(\"year\");document.querySelectorAll(\".year-carousel\").forEach(n=>{const u=n.getAttribute(\"data-group-id\");if(!u)return;const i=n.querySelectorAll(\"button[data-year]\"),d=document.querySelectorAll(`.year-pane[data-group-id=\"${u}\"]`),a=Array.from(i).map(t=>t.getAttribute(\"data-year\"));function o(t,r=!0){if(fetch(\"http://127.0.0.1:7339/ingest/0c8c3e3b-3a03-4dbd-a713-6d179189bb25\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\",\"X-Debug-Session-Id\":\"1d758d\"},body:JSON.stringify({sessionId:\"1d758d\",runId:\"pre-fix\",hypothesisId:\"yearTabs\",location:\"collection/index.astro:191\",message:\"selectYear called\",data:{groupId:u,year:t,updateUrl:r},timestamp:Date.now()})}).catch(()=>{}),i.forEach(e=>{const y=e.getAttribute(\"data-year\")===t;e.setAttribute(\"aria-selected\",y?\"true\":\"false\"),e.setAttribute(\"aria-pressed\",y?\"true\":\"false\")}),d.forEach(e=>{e.setAttribute(\"data-active\",e.getAttribute(\"data-year\")===t?\"true\":\"false\")}),r&&a.includes(t)){const e=new URL(window.location.href);e.searchParams.set(\"year\",t),window.history.replaceState({},\"\",e.toString())}}g&&a.includes(g)&&o(g,!1),i.forEach(t=>{t.addEventListener(\"click\",()=>{const r=t.getAttribute(\"data-year\");r&&o(r)}),t.getAttribute(\"aria-selected\")===\"true\"&&t.setAttribute(\"aria-pressed\",\"true\")})})})();"],["/Users/ethanwoodcox/Library/Mobile Documents/com~apple~CloudDocs/Development/the-bionicle-collective/src/pages/login.astro?astro&type=script&index=0&lang.ts","const i=document.getElementById(\"login-form\"),e=document.getElementById(\"login-error\");i.addEventListener(\"submit\",async n=>{n.preventDefault(),e.hidden=!0,e.textContent=\"\";const o=document.getElementById(\"secret\").value,t=await fetch(\"/api/admin/login\",{method:\"POST\",headers:{\"Content-Type\":\"application/json\"},body:JSON.stringify({secret:o}),credentials:\"include\"}),r=await t.json().catch(()=>({}));if(!t.ok){e.textContent=r.error||\"Login failed\",e.hidden=!1;return}const a=new URLSearchParams(window.location.search).get(\"next\")||\"/collection/\";window.location.href=a});"]],"assets":["/_astro/_id_.KwPJqKac.css","/Matoran_FoldArms_v1.png","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/index.js","/_worker.js/noop-entrypoint.mjs","/_worker.js/renderers.mjs","/fonts/Trajan Pro Regular.ttf","/_worker.js/_astro/_id_.KwPJqKac.css","/_worker.js/chunks/Layout_CTWA_KOm.mjs","/_worker.js/chunks/_@astrojs-ssr-adapter_7pHB5mfr.mjs","/_worker.js/chunks/_id__Bx96gIbF.mjs","/_worker.js/chunks/adminAuth_DFo97i-D.mjs","/_worker.js/chunks/astro-designed-error-pages_DtIjb_q6.mjs","/_worker.js/chunks/astro_Csw2fpEg.mjs","/_worker.js/chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/_worker.js/chunks/image-endpoint_BYJ4Dlad.mjs","/_worker.js/chunks/index_C-1vXZgz.mjs","/_worker.js/chunks/index_DeZA1Hnr.mjs","/_worker.js/chunks/noop-middleware_DctiQLGV.mjs","/_worker.js/chunks/path_CH3auf61.mjs","/_worker.js/chunks/remote_CrdlObHx.mjs","/_worker.js/chunks/setNamesByYear_DM9KZk86.mjs","/_worker.js/chunks/sharp_B3Cmw7UJ.mjs","/_worker.js/pages/_image.astro.mjs","/_worker.js/pages/collection.astro.mjs","/_worker.js/pages/index.astro.mjs","/_worker.js/pages/login.astro.mjs","/_worker.js/chunks/astro/server_mRoXt1Mp.mjs","/_worker.js/pages/collection/_id_.astro.mjs","/_worker.js/pages/api/admin/login.astro.mjs","/_worker.js/pages/api/collection/_id_.astro.mjs"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"bFAE/xVsJIg0XAGYXq+Vy5skNplGoSEbSo9K7lFAN/4=","sessionConfig":{"driver":"cloudflare-kv-binding","options":{"binding":"SESSION"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/cloudflare-kv-binding_DMly_2Gl.mjs');

export { manifest };
