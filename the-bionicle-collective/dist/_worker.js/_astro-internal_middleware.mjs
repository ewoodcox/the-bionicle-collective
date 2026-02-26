globalThis.process ??= {}; globalThis.process.env ??= {};
import './chunks/astro-designed-error-pages_8pAns8Ft.mjs';
import './chunks/astro/server_CfljLbGr.mjs';
import { s as sequence } from './chunks/index_D__XW2Ri.mjs';

const onRequest$1 = (context, next) => {
  if (context.isPrerendered) {
    context.locals.runtime ??= {
      env: process.env
    };
  }
  return next();
};

const onRequest = sequence(
	onRequest$1,
	
	
);

export { onRequest };
