// Writes real product/collection/review references into the live theme's
// templates/index.json via the Admin REST Asset API, then updates the
// local copy of that file to match (so it's committed to git).
//
// Usage: node --env-file=.env scripts/configure-homepage.mjs <theme_id>

import fs from 'node:fs';

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const VERSION = process.env.SHOPIFY_API_VERSION || '2025-10';
const THEME_ID = process.argv[2];

if (!THEME_ID) {
  console.error('Usage: node --env-file=.env scripts/configure-homepage.mjs <theme_id>');
  process.exit(1);
}

const template = {
  sections: {
    purelane_hero: {
      type: 'purelane-hero',
      blocks: {
        promise_1: { type: 'promise', settings: { icon: 'leaf', text: 'Plant powered' } },
        promise_2: { type: 'promise', settings: { icon: 'shield', text: 'Safe for kids & pets' } },
        promise_3: { type: 'promise', settings: { icon: 'zero', text: 'Zero harsh chemicals' } },
        slide_1: {
          type: 'slide',
          settings: { label: 'Single bottle', product_1: 'foaming-kitchen-cleaner' },
        },
        slide_2: {
          type: 'slide',
          settings: {
            label: 'Any 2 products',
            product_1: 'starter-box',
            product_2: 'tap-cleaner-limescale-remover',
          },
        },
        slide_3: {
          type: 'slide',
          settings: {
            label: 'Any 3 products',
            product_1: 'most-popular-box',
            product_2: 'tap-cleaner-limescale-remover',
            product_3: 'organic-dishwash-liquid-gel',
          },
        },
      },
      block_order: ['promise_1', 'promise_2', 'promise_3', 'slide_1', 'slide_2', 'slide_3'],
      settings: {},
    },
    purelane_reviews: {
      type: 'purelane-reviews',
      blocks: {
        review_1: { type: 'review', settings: { review: 'works-like-a-charm' } },
        review_2: { type: 'review', settings: { review: 'best-dishwash-ever' } },
        review_3: { type: 'review', settings: { review: 'great-product-great-packaging' } },
        review_4: { type: 'review', settings: { review: 'dog-friendly' } },
        review_5: { type: 'review', settings: { review: 'sparkling-taps-again' } },
      },
      block_order: ['review_1', 'review_2', 'review_3', 'review_4', 'review_5'],
      settings: {},
    },
    purelane_combos: {
      type: 'purelane-combos',
      blocks: {
        combo_1: { type: 'combo', settings: { product: 'kitchen-essentials' } },
        combo_2: { type: 'combo', settings: { product: 'laundry-care-bundle' } },
        combo_3: { type: 'combo', settings: { product: 'complete-home-bundle' } },
        combo_4: { type: 'combo', settings: { product: 'bathroom-deep-clean' } },
        combo_5: { type: 'combo', settings: { product: 'hard-water-solution-kit' } },
      },
      block_order: ['combo_1', 'combo_2', 'combo_3', 'combo_4', 'combo_5'],
      settings: {},
    },
    purelane_bundles: {
      type: 'purelane-bundles',
      blocks: {
        tier_1: { type: 'tier', settings: { product: 'starter-box', tag_label: 'Starter' } },
        tier_2: { type: 'tier', settings: { product: 'most-popular-box', tag_label: 'Most popular' } },
        tier_3: { type: 'tier', settings: { product: 'whole-home-box', tag_label: 'Whole home' } },
      },
      block_order: ['tier_1', 'tier_2', 'tier_3'],
      settings: {},
    },
    purelane_shop: {
      type: 'purelane-shop',
      settings: {
        collection: 'shop-best-sellers',
        products_to_show: 8,
      },
    },
  },
  order: ['purelane_hero', 'purelane_reviews', 'purelane_combos', 'purelane_bundles', 'purelane_shop'],
};

async function main() {
  const res = await fetch(`https://${STORE}/admin/api/${VERSION}/themes/${THEME_ID}/assets.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN },
    body: JSON.stringify({ asset: { key: 'templates/index.json', value: JSON.stringify(template, null, 2) } }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Asset update failed: ${res.status} ${JSON.stringify(json)}`);
  }
  console.log('✔ templates/index.json updated on live theme', THEME_ID);

  fs.writeFileSync('templates/index.json', JSON.stringify(template, null, 2) + '\n');
  console.log('✔ local templates/index.json updated to match');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
