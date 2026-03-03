globalThis.process ??= {}; globalThis.process.env ??= {};
import { v as decodeKey } from './chunks/astro/server_Cg27aoHm.mjs';
import './chunks/astro-designed-error-pages_BH7HHw2O.mjs';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/noop-middleware_Dr5aNlPf.mjs';

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

const manifest = deserializeManifest({"hrefRoot":"file:///C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/","cacheDir":"file:///C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/node_modules/.astro/","outDir":"file:///C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/dist/","srcDir":"file:///C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/","publicDir":"file:///C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/public/","buildClientDir":"file:///C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/dist/","buildServerDir":"file:///C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/dist/_worker.js/","adapterName":"@astrojs/cloudflare","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image\\/?$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/check","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/check\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"check","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/check.ts","pathname":"/api/admin/check","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/login","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/login\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"login","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/login.ts","pathname":"/api/admin/login","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/logout","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/logout\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"logout","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/logout.ts","pathname":"/api/admin/logout","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/admin/status","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/admin\\/status\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"admin","dynamic":false,"spread":false}],[{"content":"status","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/admin/status.ts","pathname":"/api/admin/status","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/collection/[id]","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/collection\\/([^/]+?)\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"collection","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/api/collection/[id].ts","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/kanohi/collection","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/kanohi\\/collection\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"kanohi","dynamic":false,"spread":false}],[{"content":"collection","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/kanohi/collection.ts","pathname":"/api/kanohi/collection","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_id_.BnWJ2Rin.css"}],"routeData":{"route":"/collection/[id]","isIndex":false,"type":"page","pattern":"^\\/collection\\/([^/]+?)\\/?$","segments":[[{"content":"collection","dynamic":false,"spread":false}],[{"content":"id","dynamic":true,"spread":false}]],"params":["id"],"component":"src/pages/collection/[id].astro","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_id_.BnWJ2Rin.css"}],"routeData":{"route":"/collection","isIndex":true,"type":"page","pattern":"^\\/collection\\/?$","segments":[[{"content":"collection","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/collection/index.astro","pathname":"/collection","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[{"type":"external","src":"/_astro/_id_.BnWJ2Rin.css"}],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://bioniclecollective.com","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/collection/[id].astro",{"propagation":"none","containsHead":true}],["C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/collection/index.astro",{"propagation":"none","containsHead":true}],["C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000astro-internal:middleware":"_astro-internal_middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/api/admin/check@_@ts":"pages/api/admin/check.astro.mjs","\u0000@astro-page:src/pages/api/admin/login@_@ts":"pages/api/admin/login.astro.mjs","\u0000@astro-page:src/pages/api/admin/logout@_@ts":"pages/api/admin/logout.astro.mjs","\u0000@astro-page:src/pages/api/admin/status@_@ts":"pages/api/admin/status.astro.mjs","\u0000@astro-page:src/pages/api/collection/[id]@_@ts":"pages/api/collection/_id_.astro.mjs","\u0000@astro-page:src/pages/api/kanohi/collection@_@ts":"pages/api/kanohi/collection.astro.mjs","\u0000@astro-page:src/pages/collection/[id]@_@astro":"pages/collection/_id_.astro.mjs","\u0000@astro-page:src/pages/collection/index@_@astro":"pages/collection.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"index.js","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_BsZv8LRK.mjs","C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/node_modules/unstorage/drivers/cloudflare-kv-binding.mjs":"chunks/cloudflare-kv-binding_DMly_2Gl.mjs","C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_D_usct2b.mjs","C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/collection/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.D5h217Wz.js","C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/index.astro?astro&type=script&index=0&lang.ts":"_astro/index.astro_astro_type_script_index_0_lang.C8myfd-J.js","C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts":"_astro/Layout.astro_astro_type_script_index_0_lang.CUUJTZKA.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/pages/index.astro?astro&type=script&index=0&lang.ts","(function(){if(typeof window>\"u\"||window.location.hostname!==\"edit.bioniclecollective.com\")return;const c=document.getElementById(\"home-main\"),s=document.getElementById(\"edit-gate\"),e=document.getElementById(\"edit-gate-status\"),o=document.getElementById(\"edit-gate-form\"),l=document.getElementById(\"edit-gate-logged-in\");!c||!s||!e||!o||!l||(c.hidden=!0,s.hidden=!1,fetch(\"/api/admin/check\",{credentials:\"include\"}).then(n=>n.json()).then(n=>{n.ok?(e.hidden=!0,l.hidden=!1):(e.hidden=!0,o.hidden=!1)}).catch(()=>{e.textContent=\"Could not check session.\",o.hidden=!1}),o.addEventListener(\"submit\",n=>{n.preventDefault();const i=document.getElementById(\"edit-gate-key\"),u=i&&i.value?i.value.trim():\"\";if(!u)return;const d=new URLSearchParams(window.location.search).get(\"next\"),r=d&&d.startsWith(\"/\")?d:\"/collection/\";fetch(`/api/admin/login?next=${encodeURIComponent(r)}`,{method:\"POST\",body:JSON.stringify({key:u}),headers:{\"Content-Type\":\"application/json\"},credentials:\"include\"}).then(t=>{if(t.ok){window.location.href=r;return}t.json().then(a=>{e.textContent=a.error||\"Invalid key\",e.hidden=!1}).catch(async()=>{const a=await t.text(),h=t.status===503?\"Admin login not configured. Check https://edit.bioniclecollective.com/api/admin/status and set ADMIN_SECRET in Cloudflare Pages env.\":`Login failed (${t.status}). See Cloudflare: Workers & Pages → your project → Logs.`;e.textContent=a?`Login failed (${t.status}).`:h,e.hidden=!1})})}))})();"],["C:/Users/ethan/iCloudDrive/Development/the-bionicle-collective/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts","(function(){if(typeof window>\"u\")return;const n=document.getElementById(\"site-nav\"),t=document.getElementById(\"nav-toggle\"),i=document.getElementById(\"nav-logout\");t&&n&&t.addEventListener(\"click\",()=>{const e=n.classList.toggle(\"site-nav--open\");t.setAttribute(\"aria-expanded\",e?\"true\":\"false\")}),window.location.hostname===\"edit.bioniclecollective.com\"&&i&&fetch(\"/api/admin/check\",{credentials:\"include\"}).then(e=>e.json()).then(e=>{e.ok&&(i.hidden=!1)}).catch(()=>{})})();"]],"assets":["/_astro/_id_.BnWJ2Rin.css","/Matoran_FoldArms_v1.png","/TBC logo for site.png","/fonts/Trajan Pro Regular.ttf","/_astro/index.astro_astro_type_script_index_0_lang.D5h217Wz.js","/_worker.js/index.js","/_worker.js/noop-entrypoint.mjs","/_worker.js/renderers.mjs","/_worker.js/_@astrojs-ssr-adapter.mjs","/_worker.js/_astro-internal_middleware.mjs","/_worker.js/chunks/adminAuth_CE1MGqB7.mjs","/_worker.js/chunks/astro-designed-error-pages_BH7HHw2O.mjs","/_worker.js/chunks/astro_Cdpd96l7.mjs","/_worker.js/chunks/cloudflare-kv-binding_DMly_2Gl.mjs","/_worker.js/chunks/constants_Cc7xRAlb.mjs","/_worker.js/chunks/image-endpoint_eDjBZRlS.mjs","/_worker.js/chunks/index_B_evQWZ3.mjs","/_worker.js/chunks/Layout_DV-VAzd_.mjs","/_worker.js/chunks/noop-middleware_Dr5aNlPf.mjs","/_worker.js/chunks/path_Ckrgf70T.mjs","/_worker.js/chunks/remote_DAPhkM6-.mjs","/_worker.js/chunks/sharp_D_usct2b.mjs","/_worker.js/chunks/_@astrojs-ssr-adapter_DYqLojrR.mjs","/_worker.js/pages/collection.astro.mjs","/_worker.js/pages/index.astro.mjs","/_worker.js/pages/_image.astro.mjs","/_worker.js/chunks/astro/server_Cg27aoHm.mjs","/_worker.js/_astro/_id_.BnWJ2Rin.css","/_worker.js/pages/collection/_id_.astro.mjs","/_worker.js/pages/api/admin/check.astro.mjs","/_worker.js/pages/api/admin/login.astro.mjs","/_worker.js/pages/api/admin/logout.astro.mjs","/_worker.js/pages/api/admin/status.astro.mjs","/_worker.js/pages/api/collection/_id_.astro.mjs","/_worker.js/pages/api/kanohi/collection.astro.mjs"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"actionBodySizeLimit":1048576,"serverIslandNameMap":[],"key":"zmtzCHgvOrXYKradv26j32hq4NsRnvzN87abxZwpkVg=","sessionConfig":{"driver":"cloudflare-kv-binding","options":{"binding":"SESSION"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/cloudflare-kv-binding_DMly_2Gl.mjs');

export { manifest };
