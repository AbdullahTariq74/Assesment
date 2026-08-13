// Publishes every product and collection created by seed-products.mjs to
// the "Online Store" sales channel. Products/collections created via the
// Admin API are NOT published to any channel by default — without this,
// they're invisible to storefront rendering even when correctly
// referenced from a section block.
//
// Usage: node --env-file=.env scripts/publish-to-online-store.mjs

import { shopifyGraphQL, assertNoUserErrors } from './lib/shopify-admin.mjs';

async function getOnlineStorePublicationId() {
  const data = await shopifyGraphQL(`query { publications(first: 10) { nodes { id name } } }`);
  const pub = data.publications.nodes.find((p) => p.name === 'Online Store');
  if (!pub) throw new Error('No "Online Store" publication found on this shop.');
  return pub.id;
}

async function publish(id, publicationId) {
  const data = await shopifyGraphQL(
    `mutation Publish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        userErrors { field message }
      }
    }`,
    { id, input: [{ publicationId }] }
  );
  assertNoUserErrors(data, 'publishablePublish');
}

async function main() {
  const publicationId = await getOnlineStorePublicationId();
  console.log(`Online Store publication: ${publicationId}\n`);

  const data = await shopifyGraphQL(
    `query { products(first: 50) { nodes { id title } } collections(first: 10) { nodes { id title } } }`
  );

  console.log('Publishing products...');
  for (const p of data.products.nodes) {
    await publish(p.id, publicationId);
    console.log(`  ✔ ${p.title}`);
  }

  console.log('\nPublishing collections...');
  for (const c of data.collections.nodes) {
    await publish(c.id, publicationId);
    console.log(`  ✔ ${c.title}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
