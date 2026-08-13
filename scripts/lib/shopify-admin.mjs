const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION || '2025-10';

if (!STORE || !TOKEN) {
  throw new Error(
    'SHOPIFY_STORE and SHOPIFY_ADMIN_TOKEN must be set. Run scripts with `node --env-file=.env scripts/<name>.mjs`.'
  );
}

const ENDPOINT = `https://${STORE}/admin/api/${VERSION}/graphql.json`;

export async function shopifyGraphQL(query, variables = {}) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await res.json();

  if (!res.ok || json.errors) {
    throw new Error(`GraphQL request failed: ${JSON.stringify(json.errors || json, null, 2)}`);
  }

  return json.data;
}

/** Throws if any mutation's userErrors array is non-empty. Pass the field
 *  name (e.g. 'productCreate') and the mutation's data payload. */
export function assertNoUserErrors(data, field) {
  const payload = data[field];
  const errors = payload?.userErrors;
  if (errors && errors.length > 0) {
    throw new Error(`${field} userErrors: ${JSON.stringify(errors, null, 2)}`);
  }
  return payload;
}
