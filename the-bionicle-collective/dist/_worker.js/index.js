globalThis.process ??= {}; globalThis.process.env ??= {};
import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_DYqLojrR.mjs';
import { manifest } from './manifest_Bs91FC2q.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/admin/check.astro.mjs');
const _page2 = () => import('./pages/api/admin/login.astro.mjs');
const _page3 = () => import('./pages/api/admin/logout.astro.mjs');
const _page4 = () => import('./pages/api/admin/status.astro.mjs');
const _page5 = () => import('./pages/api/collection/_id_.astro.mjs');
const _page6 = () => import('./pages/api/kanohi/collection.astro.mjs');
const _page7 = () => import('./pages/collection/_id_.astro.mjs');
const _page8 = () => import('./pages/collection.astro.mjs');
const _page9 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/@astrojs/cloudflare/dist/entrypoints/image-endpoint.js", _page0],
    ["src/pages/api/admin/check.ts", _page1],
    ["src/pages/api/admin/login.ts", _page2],
    ["src/pages/api/admin/logout.ts", _page3],
    ["src/pages/api/admin/status.ts", _page4],
    ["src/pages/api/collection/[id].ts", _page5],
    ["src/pages/api/kanohi/collection.ts", _page6],
    ["src/pages/collection/[id].astro", _page7],
    ["src/pages/collection/index.astro", _page8],
    ["src/pages/index.astro", _page9]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_astro-internal_middleware.mjs')
});
const _args = undefined;
const _exports = createExports(_manifest);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
