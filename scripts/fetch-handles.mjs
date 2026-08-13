// Prints handles for every seeded product/collection, and each review
// metaobject's handle — needed to write real references into
// templates/index.json (product/collection settings store handles).
//
// Usage: node --env-file=.env scripts/fetch-handles.mjs

import { shopifyGraphQL } from './lib/shopify-admin.mjs';

async function main() {
  const data = await shopifyGraphQL(`
    query {
      products(first: 50) { nodes { title handle } }
      collections(first: 10) { nodes { title handle } }
      metaobjects(type: "review", first: 20) {
        nodes {
          handle
          fields { key value }
        }
      }
    }
  `);

  console.log('--- Products ---');
  for (const p of data.products.nodes) console.log(`${p.handle}\t${p.title}`);

  console.log('\n--- Collections ---');
  for (const c of data.collections.nodes) console.log(`${c.handle}\t${c.title}`);

  console.log('\n--- Review metaobjects ---');
  for (const m of data.metaobjects.nodes) {
    const title = m.fields.find((f) => f.key === 'title')?.value;
    console.log(`${m.handle}\t${title}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
