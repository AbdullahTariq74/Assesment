// Seeds the dev store with the Purelane catalog: 10 individual products
// (Shop grid), 5 combo products, 3 bundle-tier products, a "Shop —
// Best sellers" collection, and 5 review metaobjects. Run
// scripts/setup-metafields.mjs first.
//
// Usage: node --env-file=.env scripts/seed-products.mjs

import { shopifyGraphQL, assertNoUserErrors } from './lib/shopify-admin.mjs';
import { makePlaceholderPng } from './lib/placeholder-image.mjs';

// ---------- catalog data ----------

const INDIVIDUAL_PRODUCTS = [
  {
    key: 'tap',
    title: 'Tap Cleaner & Limescale Remover',
    description: 'Melts hard water stains and limescale off taps, fittings and shower heads without harsh acids.',
    price: 200,
    compareAtPrice: 299,
    badge: 'Best seller',
    rating: 4.8,
    ratingCount: 237,
    colors: ['#8168c9', '#6250ad'],
  },
  {
    key: 'kitchen',
    title: 'Foaming Kitchen Cleaner',
    description: 'A plant-based degreaser that foams onto hobs, tiles and countertops and cuts through grease instantly.',
    price: 200,
    compareAtPrice: 299,
    badge: 'Best seller',
    rating: 4.8,
    ratingCount: 254,
    colors: ['#7a62c2', '#6b55b8'],
  },
  {
    key: 'brass',
    title: 'Copper, Bronze & Brass Cleaner',
    description: 'Restores shine to copper, bronze and brass fittings without the fumes of chemical polishes.',
    price: 200,
    compareAtPrice: 299,
    badge: 'Top rated',
    rating: 4.8,
    ratingCount: 231,
    colors: null, // deliberately no image — exercises the "no image" placeholder state
  },
  {
    key: 'washingmachine',
    title: 'Washing Machine Cleaner & Descaler Tablets',
    description: 'Descaling tablets that clear detergent build-up and hard-water scale from the drum and pipes.',
    price: 200,
    compareAtPrice: 299,
    badge: 'New',
    rating: 4.8,
    ratingCount: 183,
    colors: ['#554299', '#4b3a8f'],
  },
  {
    key: 'dishwash',
    title: 'Organic Dishwash Liquid Gel',
    description: 'A gentle, plant-based dishwash gel that cuts grease without drying out your hands.',
    price: 220,
    compareAtPrice: 320,
    badge: '',
    rating: 4.7,
    ratingCount: 198,
    colors: ['#5a46a3', '#4b3a8f'],
  },
  {
    key: 'laundry',
    title: 'Non-Toxic Laundry Detergent',
    description: 'Removes tough stains and odour on a cold wash, safe for sensitive skin and septic systems.',
    price: 250,
    compareAtPrice: 350,
    badge: '',
    rating: 4.6,
    ratingCount: 176,
    colors: ['#5a46a3', '#554299'],
    soldOut: true, // deliberately out of stock — exercises the sold-out state
  },
  {
    key: 'floor',
    title: 'Natural Herbal Floor Cleaner',
    description: 'A herbal floor cleaner that kills 99.9% of germs and is safe around kids and pets once dry.',
    price: 230,
    compareAtPrice: 330,
    badge: '',
    rating: 4.7,
    ratingCount: 164,
    colors: ['#8168c9', '#7a62c2'],
  },
  {
    key: 'toilet',
    title: 'Non-Toxic Toilet Cleaner',
    description: 'A plant-based toilet cleaner that fights limescale and germs in the bowl without harsh fumes.',
    price: 210,
    compareAtPrice: 310,
    badge: '',
    rating: 4.6,
    ratingCount: 142,
    colors: ['#7a62c2', '#6250ad'],
  },
  {
    key: 'handwash',
    title: 'Gentle Hydrating Liquid Handwash',
    description: 'A hydrating, plant-based handwash gentle enough for frequent use.',
    price: 190,
    compareAtPrice: 290,
    badge: '',
    rating: 4.8,
    ratingCount: 205,
    colors: ['#8f74d4', '#7a62c2'],
  },
  {
    key: 'longtitle',
    title:
      'Purelane Ultra-Concentrated Ready-to-Use Plant-Based Multi-Surface Kitchen, Bathroom & Floor Disinfectant Cleaner Spray — Family Value Pack, 1 Litre',
    description: 'Our most concentrated multi-surface cleaner, reformulated as one all-purpose family-size spray.',
    price: 450,
    compareAtPrice: 600,
    badge: '',
    rating: 4.5,
    ratingCount: 61,
    colors: ['#6b55b8', '#4b3a8f'], // deliberately very long title — exercises card title clamping
  },
];

const COMBOS = [
  {
    title: 'Kitchen Essentials',
    description: 'Everything for a sparkling kitchen, no need to pick separately.',
    price: 499,
    compareAtPrice: 897,
    badge: 'Most popular',
    featured: true,
    included: ['kitchen', 'dishwash', 'tap'],
    colors: ['#6b55b8', '#5a46a3'],
  },
  {
    title: 'Laundry Care Bundle',
    description: 'Softer, fresher wash and a cleaner machine, all in one box.',
    price: 499,
    compareAtPrice: 947,
    badge: '',
    featured: false,
    included: ['laundry', 'washingmachine'],
    colors: ['#554299', '#4b3a8f'],
  },
  {
    title: 'Complete Home Bundle',
    description: 'Our biggest saving box — one of everything you need, room to room.',
    price: 799,
    compareAtPrice: 1495,
    badge: 'Best value',
    featured: true,
    included: ['kitchen', 'laundry', 'floor', 'toilet', 'handwash'],
    colors: ['#7a62c2', '#6250ad'],
  },
  {
    title: 'Bathroom Deep Clean',
    description: 'A complete bathroom refresh in one box.',
    price: 499,
    compareAtPrice: 897,
    badge: '',
    featured: false,
    included: ['toilet', 'tap', 'brass'],
    colors: ['#8168c9', '#7a62c2'],
  },
  {
    title: 'Hard Water Solution Kit',
    description: 'A quick, focused fix for hard water stains across the home.',
    price: 349,
    compareAtPrice: 598,
    badge: '',
    featured: false,
    included: ['tap', 'toilet'],
    colors: ['#8f74d4', '#8168c9'],
  },
];

const BUNDLE_TIERS = [
  {
    title: 'Starter Box',
    tag: 'Starter',
    price: 349,
    compareAtPrice: 598,
    productCount: 2,
    perks: ['Pick any two products', 'Free shipping across India'],
    featured: false,
  },
  {
    title: 'Most Popular Box',
    tag: 'Most popular',
    price: 499,
    compareAtPrice: 897,
    productCount: 3,
    perks: ['Pick any three products', 'Covers kitchen and laundry', 'Free shipping across India'],
    featured: true,
  },
  {
    title: 'Whole Home Box',
    tag: 'Whole home',
    price: 799,
    compareAtPrice: 1495,
    productCount: 5,
    perks: ['Pick any five products', 'Every room in one order', 'Free shipping across India'],
    featured: false,
  },
];

const REVIEWS = [
  {
    rating: 5,
    title: 'Works like a charm',
    body: 'Finally an eco option that cleans as well as the chemical detergent I used for years, and it smells better.',
    author: 'Anita',
    productKey: 'laundry',
  },
  {
    rating: 5,
    title: 'Best dishwash ever',
    body: 'Our old dishwash left my help with dry, cracked skin. That stopped completely after we switched.',
    author: 'Priya',
    productKey: 'dishwash',
  },
  {
    rating: 5,
    title: 'Great product, great packaging',
    body: 'Very soft on hands with a lovely fragrance, and it feels good to be using far less plastic.',
    author: 'Sunita',
    productKey: 'handwash',
  },
  {
    rating: 5,
    title: 'Dog friendly',
    body: "We switched because chemical floor cleaners were setting off my dog's allergies. No reactions since.",
    author: 'Rohit S.',
    productKey: 'floor',
  },
  {
    rating: 5,
    title: 'Sparkling taps again',
    body: 'Hard water had ruined our bathroom fittings. Two sprays and the scale wipes straight off, no scrubbing.',
    author: 'Verified buyer',
    productKey: 'tap',
  },
];

// ---------- GraphQL helpers ----------

// Re-running this script must not create duplicates if an earlier run
// partially completed (e.g. stopped on a missing API scope). Fetch every
// existing product once and skip re-creating anything with a matching
// title.
let existingProductsByTitle = null;

async function loadExistingProducts() {
  if (existingProductsByTitle) return existingProductsByTitle;
  existingProductsByTitle = new Map();
  let cursor = null;
  for (;;) {
    const data = await shopifyGraphQL(
      `query ExistingProducts($cursor: String) {
        products(first: 100, after: $cursor) {
          nodes { id title variants(first: 1) { nodes { id } } }
          pageInfo { hasNextPage endCursor }
        }
      }`,
      { cursor }
    );
    for (const node of data.products.nodes) {
      existingProductsByTitle.set(node.title, { id: node.id, variantId: node.variants.nodes[0]?.id });
    }
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return existingProductsByTitle;
}

async function createProduct({ title, description, price, compareAtPrice }) {
  const existing = await loadExistingProducts();
  if (existing.has(title)) {
    console.log(`    (already exists, skipping create)`);
    return { ...existing.get(title), alreadyExisted: true };
  }

  const data = await shopifyGraphQL(
    `mutation CreateProduct($input: ProductInput!) {
      productCreate(input: $input) {
        product {
          id
          variants(first: 1) { nodes { id } }
        }
        userErrors { field message }
      }
    }`,
    { input: { title, descriptionHtml: `<p>${description}</p>`, status: 'ACTIVE' } }
  );
  const { product } = assertNoUserErrors(data, 'productCreate');
  const variantId = product.variants.nodes[0].id;

  const priceData = await shopifyGraphQL(
    `mutation UpdateVariantPrice($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
      productVariantsBulkUpdate(productId: $productId, variants: $variants) {
        userErrors { field message }
      }
    }`,
    {
      productId: product.id,
      variants: [{ id: variantId, price: String(price), compareAtPrice: String(compareAtPrice) }],
    }
  );
  assertNoUserErrors(priceData, 'productVariantsBulkUpdate');

  return { id: product.id, variantId, alreadyExisted: false };
}

async function setMetafields(ownerId, fields) {
  const metafields = fields
    .filter((f) => f.value !== undefined && f.value !== null && f.value !== '')
    .map((f) => ({ ownerId, namespace: 'custom', key: f.key, type: f.type, value: f.value }));
  if (metafields.length === 0) return;

  const data = await shopifyGraphQL(
    `mutation SetMetafields($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        userErrors { field message }
      }
    }`,
    { metafields }
  );
  assertNoUserErrors(data, 'metafieldsSet');
}

async function uploadImage(productId, pngBase64, filename) {
  const bytes = Buffer.from(pngBase64, 'base64');

  const stagedData = await shopifyGraphQL(
    `mutation StageUpload($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    {
      input: [
        {
          resource: 'IMAGE',
          filename,
          mimeType: 'image/png',
          httpMethod: 'POST',
          fileSize: String(bytes.length),
        },
      ],
    }
  );
  const { stagedTargets } = assertNoUserErrors(stagedData, 'stagedUploadsCreate');
  const target = stagedTargets[0];

  const form = new FormData();
  for (const param of target.parameters) form.append(param.name, param.value);
  form.append('file', new Blob([bytes], { type: 'image/png' }), filename);

  const uploadRes = await fetch(target.url, { method: 'POST', body: form });
  if (!uploadRes.ok) {
    throw new Error(`Staged upload failed: ${uploadRes.status} ${await uploadRes.text()}`);
  }

  const mediaData = await shopifyGraphQL(
    `mutation AttachMedia($productId: ID!, $media: [CreateMediaInput!]!) {
      productCreateMedia(productId: $productId, media: $media) {
        media { id }
        mediaUserErrors { field message }
      }
    }`,
    { productId, media: [{ originalSource: target.resourceUrl, mediaContentType: 'IMAGE' }] }
  );
  if (mediaData.productCreateMedia.mediaUserErrors?.length) {
    throw new Error(`productCreateMedia errors: ${JSON.stringify(mediaData.productCreateMedia.mediaUserErrors)}`);
  }
}

async function createCollection(title, productIds) {
  const data = await shopifyGraphQL(
    `mutation CreateCollection($input: CollectionInput!) {
      collectionCreate(input: $input) {
        collection { id }
        userErrors { field message }
      }
    }`,
    { input: { title, products: productIds } }
  );
  return assertNoUserErrors(data, 'collectionCreate').collection.id;
}

async function createReviewMetaobject({ rating, title, body, author, productId }) {
  const fields = [
    { key: 'rating', value: String(rating) },
    { key: 'title', value: title },
    { key: 'body', value: body },
    { key: 'author', value: author },
  ];
  if (productId) fields.push({ key: 'product', value: productId });

  const data = await shopifyGraphQL(
    `mutation CreateReview($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id }
        userErrors { field message }
      }
    }`,
    { metaobject: { type: 'review', fields } }
  );
  return assertNoUserErrors(data, 'metaobjectCreate').metaobject.id;
}

// ---------- main ----------

async function main() {
  const productsByKey = {};

  console.log('Creating individual products...');
  for (const p of INDIVIDUAL_PRODUCTS) {
    const { id, variantId, alreadyExisted } = await createProduct(p);
    productsByKey[p.key] = { id, variantId };
    console.log(`  ✔ ${p.title}`);

    if (!alreadyExisted) {
      await setMetafields(id, [
        { key: 'badge_label', type: 'single_line_text_field', value: p.badge },
        { key: 'rating_average', type: 'number_decimal', value: String(p.rating) },
        { key: 'rating_count', type: 'number_integer', value: String(p.ratingCount) },
      ]);

      if (p.colors) {
        const png = makePlaceholderPng(600, 900, p.colors[0], p.colors[1]);
        await uploadImage(id, png, `${p.key}.png`);
      }
    }

    if (p.soldOut) {
      const invData = await shopifyGraphQL(`query { productVariant(id: "${variantId}") { inventoryItem { id } } }`);
      const inventoryItemId = invData.productVariant.inventoryItem.id;
      const locData = await shopifyGraphQL(`query { locations(first: 1) { nodes { id } } }`);
      const locationId = locData.locations.nodes[0].id;

      await shopifyGraphQL(
        `mutation($id: ID!, $input: InventoryItemInput!) {
          inventoryItemUpdate(id: $id, input: $input) { userErrors { field message } }
        }`,
        { id: inventoryItemId, input: { tracked: true } }
      );
      await shopifyGraphQL(
        `mutation($inventoryItemId: ID!, $locationId: ID!) {
          inventoryActivate(inventoryItemId: $inventoryItemId, locationId: $locationId) {
            userErrors { field message }
          }
        }`,
        { inventoryItemId, locationId }
      );
      await shopifyGraphQL(
        `mutation($input: InventorySetQuantitiesInput!) {
          inventorySetQuantities(input: $input) { userErrors { field message } }
        }`,
        { input: { reason: 'correction', name: 'available', quantities: [{ inventoryItemId, locationId, quantity: 0 }] } }
      );
      await shopifyGraphQL(
        `mutation($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
          productVariantsBulkUpdate(productId: $productId, variants: $variants) {
            userErrors { field message }
          }
        }`,
        { productId: id, variants: [{ id: variantId, inventoryPolicy: 'DENY' }] }
      );
      console.log(`    (marked sold out)`);
    }
  }

  console.log('\nCreating collection "Shop — Best sellers"...');
  const collectionId = await createCollection(
    'Shop — Best sellers',
    INDIVIDUAL_PRODUCTS.map((p) => productsByKey[p.key].id)
  );
  console.log(`  ✔ ${collectionId}`);

  console.log('\nCreating combo products...');
  const combosByTitle = {};
  for (const c of COMBOS) {
    const { id } = await createProduct(c);
    combosByTitle[c.title] = id;
    console.log(`  ✔ ${c.title}`);

    const includedGids = c.included.map((key) => productsByKey[key].id);
    await setMetafields(id, [
      { key: 'badge_label', type: 'single_line_text_field', value: c.badge },
      { key: 'featured', type: 'boolean', value: String(c.featured) },
      { key: 'included_products', type: 'list.product_reference', value: JSON.stringify(includedGids) },
    ]);

    if (c.colors) {
      const png = makePlaceholderPng(600, 900, c.colors[0], c.colors[1]);
      await uploadImage(id, png, `combo-${c.title.toLowerCase().replace(/\s+/g, '-')}.png`);
    }
  }

  console.log('\nCreating bundle tier products...');
  const tiersByTitle = {};
  for (const t of BUNDLE_TIERS) {
    const { id } = await createProduct({ ...t, description: `${t.tag} bundle — pick any ${t.productCount} products.` });
    tiersByTitle[t.title] = id;
    console.log(`  ✔ ${t.title}`);

    await setMetafields(id, [
      { key: 'featured', type: 'boolean', value: String(t.featured) },
      { key: 'bundle_product_count', type: 'number_integer', value: String(t.productCount) },
      { key: 'bundle_perks', type: 'list.single_line_text_field', value: JSON.stringify(t.perks) },
    ]);
  }

  console.log('\nCreating review metaobjects...');
  const reviewIds = [];
  for (const r of REVIEWS) {
    const productId = productsByKey[r.productKey]?.id;
    const reviewId = await createReviewMetaobject({ ...r, productId });
    reviewIds.push(reviewId);
    console.log(`  ✔ ${r.title}`);
  }

  console.log('\nAll done. IDs for wiring into template blocks:\n');
  console.log(JSON.stringify({
    products: Object.fromEntries(Object.entries(productsByKey).map(([k, v]) => [k, v.id])),
    combos: combosByTitle,
    tiers: tiersByTitle,
    collectionId,
    reviewIds,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
