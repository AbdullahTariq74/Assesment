// Replaces the flat-color placeholder images with bottle-silhouette
// placeholders (see scripts/lib/placeholder-image.mjs) on every seeded
// product that has one. Deletes the old media first, then uploads the new
// shape — Shopify doesn't have a "replace" mutation, media is add/delete.
//
// Usage: node --env-file=.env scripts/regenerate-images.mjs

import { shopifyGraphQL, assertNoUserErrors } from './lib/shopify-admin.mjs';
import { makePlaceholderPng } from './lib/placeholder-image.mjs';

const PRODUCTS = [
  { handle: 'tap-cleaner-limescale-remover', colors: ['#8168c9', '#6250ad'] },
  { handle: 'foaming-kitchen-cleaner', colors: ['#7a62c2', '#6b55b8'] },
  { handle: 'washing-machine-cleaner-descaler-tablets', colors: ['#554299', '#4b3a8f'] },
  { handle: 'organic-dishwash-liquid-gel', colors: ['#5a46a3', '#4b3a8f'] },
  { handle: 'non-toxic-laundry-detergent', colors: ['#5a46a3', '#554299'] },
  { handle: 'natural-herbal-floor-cleaner', colors: ['#8168c9', '#7a62c2'] },
  { handle: 'non-toxic-toilet-cleaner', colors: ['#7a62c2', '#6250ad'] },
  { handle: 'gentle-hydrating-liquid-handwash', colors: ['#8f74d4', '#7a62c2'] },
  {
    handle:
      'purelane-ultra-concentrated-ready-to-use-plant-based-multi-surface-kitchen-bathroom-floor-disinfectant-cleaner-spray-family-value-pack-1-litre',
    colors: ['#6b55b8', '#4b3a8f'],
  },
  { handle: 'kitchen-essentials', colors: ['#6b55b8', '#5a46a3'] },
  { handle: 'laundry-care-bundle', colors: ['#554299', '#4b3a8f'] },
  { handle: 'complete-home-bundle', colors: ['#7a62c2', '#6250ad'] },
  { handle: 'bathroom-deep-clean', colors: ['#8168c9', '#7a62c2'] },
  { handle: 'hard-water-solution-kit', colors: ['#8f74d4', '#8168c9'] },
  { handle: 'starter-box', colors: ['#6b55b8', '#5a46a3'] },
  { handle: 'most-popular-box', colors: ['#7a62c2', '#6250ad'] },
  { handle: 'whole-home-box', colors: ['#8168c9', '#6b55b8'] },
];

async function uploadImage(productId, pngBase64, filename) {
  const bytes = Buffer.from(pngBase64, 'base64');
  const stagedData = await shopifyGraphQL(
    `mutation StageUpload($input: [StagedUploadInput!]!) {
      stagedUploadsCreate(input: $input) {
        stagedTargets { url resourceUrl parameters { name value } }
        userErrors { field message }
      }
    }`,
    { input: [{ resource: 'IMAGE', filename, mimeType: 'image/png', httpMethod: 'POST', fileSize: String(bytes.length) }] }
  );
  const { stagedTargets } = assertNoUserErrors(stagedData, 'stagedUploadsCreate');
  const target = stagedTargets[0];

  const form = new FormData();
  for (const param of target.parameters) form.append(param.name, param.value);
  form.append('file', new Blob([bytes], { type: 'image/png' }), filename);
  const uploadRes = await fetch(target.url, { method: 'POST', body: form });
  if (!uploadRes.ok) throw new Error(`Staged upload failed: ${uploadRes.status} ${await uploadRes.text()}`);

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
    throw new Error(JSON.stringify(mediaData.productCreateMedia.mediaUserErrors));
  }
}

async function main() {
  for (const p of PRODUCTS) {
    const data = await shopifyGraphQL(
      `query { productByHandle(handle: "${p.handle}") { id media(first: 5) { nodes { id } } } }`
    );
    const product = data.productByHandle;
    if (!product) {
      console.log(`  ! ${p.handle} not found, skipping`);
      continue;
    }

    if (product.media.nodes.length > 0) {
      const del = await shopifyGraphQL(
        `mutation DeleteMedia($productId: ID!, $mediaIds: [ID!]!) {
          productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
            deletedMediaIds
            mediaUserErrors { field message }
          }
        }`,
        { productId: product.id, mediaIds: product.media.nodes.map((m) => m.id) }
      );
      if (del.productDeleteMedia.mediaUserErrors?.length) {
        throw new Error(JSON.stringify(del.productDeleteMedia.mediaUserErrors));
      }
    }

    const png = makePlaceholderPng(600, 900, p.colors[0], p.colors[1]);
    await uploadImage(product.id, png, `${p.handle}-v2.png`);
    console.log(`  ✔ ${p.handle}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
