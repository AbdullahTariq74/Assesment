// Prints the live templates/index.json currently stored on a given theme —
// useful for confirming what configure-homepage.mjs actually wrote.
// Usage: node --env-file=.env scripts/inspect-asset.mjs <theme_id>

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION || '2025-10';
const THEME_ID = process.argv[2];

const res = await fetch(
  `https://${STORE}/admin/api/${VERSION}/themes/${THEME_ID}/assets.json?asset[key]=templates/index.json`,
  { headers: { 'X-Shopify-Access-Token': TOKEN } }
);
const json = await res.json();
if (!res.ok) {
  console.error(JSON.stringify(json, null, 2));
  process.exit(1);
}
const value = JSON.parse(json.asset.value);
console.log(JSON.stringify(value, null, 2));
