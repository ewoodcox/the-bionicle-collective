#!/usr/bin/env node
/**
 * Fetch Kanohi mask data from BrickLink API.
 * Requires: BRICKLINK_CONSUMER_KEY, BRICKLINK_CONSUMER_SECRET,
 *           BRICKLINK_TOKEN, BRICKLINK_TOKEN_SECRET
 *
 * Usage: node scripts/fetch-kanohi-bricklink.mjs
 *
 * Validates part numbers against the BrickLink catalog. Run from project root.
 */

import { createHmac } from 'crypto';

const API_BASE = 'https://api.bricklink.com/api/store/v1';

function oauthSign(method, url, params, consumerSecret, tokenSecret) {
  const sorted = Object.keys(params).sort();
  const base = sorted.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
  const signBase = [method, encodeURIComponent(url), encodeURIComponent(base)].join('&');
  const key = `${encodeURIComponent(consumerSecret)}&${encodeURIComponent(tokenSecret)}`;
  return createHmac('sha1', key).update(signBase).digest('base64');
}

async function bricklinkRequest(path, { consumerKey, consumerSecret, token, tokenSecret }) {
  const url = `${API_BASE}${path}`;
  const nonce = Math.random().toString(36).slice(2) + Date.now();
  const params = {
    oauth_consumer_key: consumerKey,
    oauth_token: token,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: String(Math.floor(Date.now() / 1000)),
    oauth_nonce: nonce,
    oauth_version: '1.0',
  };
  params.oauth_signature = oauthSign('GET', url, params, consumerSecret, tokenSecret);
  const authHeader =
    'OAuth ' +
    Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
      .join(', ');

  const res = await fetch(url, { headers: { Authorization: authHeader } });
  const json = await res.json();
  if (json.meta?.code >= 400) {
    throw new Error(json.meta?.message || JSON.stringify(json));
  }
  return json.data;
}

const NUVA_MASKS_2002 = [
  { partId: '43853', name: 'Hau Nuva', fullName: 'Mask of Shielding Nuva' },
  { partId: '43614', name: 'Miru Nuva', fullName: 'Mask of Levitation Nuva' },
  { partId: '43615', name: 'Kakama Nuva', fullName: 'Mask of Speed Nuva' },
  { partId: '43616', name: 'Pakari Nuva', fullName: 'Mask of Strength Nuva' },
  { partId: '43855', name: 'Akaku Nuva', fullName: 'Mask of X-Ray Vision Nuva' },
  { partId: '43856', name: 'Kaukau Nuva', fullName: 'Mask of Water Breathing Nuva' },
];

const TOA_COLORS = [
  { color: 'red', colorLabel: 'Red', bricklinkColorId: '5' },
  { color: 'green', colorLabel: 'Green', bricklinkColorId: '6' },
  { color: 'blue', colorLabel: 'Blue', bricklinkColorId: '7' },
  { color: 'white', colorLabel: 'White', bricklinkColorId: '1' },
  { color: 'brown', colorLabel: 'Brown', bricklinkColorId: '8' },
  { color: 'black', colorLabel: 'Black', bricklinkColorId: '11' },
];

async function main() {
  const consumerKey = process.env.BRICKLINK_CONSUMER_KEY;
  const consumerSecret = process.env.BRICKLINK_CONSUMER_SECRET;
  const token = process.env.BRICKLINK_TOKEN;
  const tokenSecret = process.env.BRICKLINK_TOKEN_SECRET;

  if (!consumerKey || !consumerSecret || !token || !tokenSecret) {
    console.error(
      'Missing env: BRICKLINK_CONSUMER_KEY, BRICKLINK_CONSUMER_SECRET, BRICKLINK_TOKEN, BRICKLINK_TOKEN_SECRET'
    );
    console.error('Get credentials at https://www.bricklink.com/v2/api/register_consumer.page');
    process.exit(1);
  }

  const creds = { consumerKey, consumerSecret, token, tokenSecret };
  const validated = [];

  for (const mask of NUVA_MASKS_2002) {
    try {
      const item = await bricklinkRequest(`/items/PART/${mask.partId}`, creds);
      console.log(`OK ${mask.partId} ${item?.name || mask.name}`);
      for (const c of TOA_COLORS) {
        validated.push({
          id: `${mask.name.toLowerCase().replace(/\s+/g, '-')}-${c.color}-2002`,
          name: mask.name,
          fullName: mask.fullName,
          type: 'nuva',
          year: 2002,
          color: c.color,
          colorLabel: c.colorLabel,
          partId: mask.partId,
          bricklinkColorId: c.bricklinkColorId,
          source: 'pack',
          sourceNote: '8597/8598',
          isRare: false,
        });
      }
    } catch (err) {
      console.error(`ERR ${mask.partId} ${mask.name}:`, err.message);
    }
  }

  console.log(`\nValidated ${validated.length} mask entries.`);
  console.log(JSON.stringify(validated, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
