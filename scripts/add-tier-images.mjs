// Adds a placeholder image to the 3 bundle-tier products so the Hero
// carousel's "any 2/3 products" slides (which use a tier product as the
// price source) don't fall back to Dawn's generic placeholder icon.
// Usage: node --env-file=.env scripts/add-tier-images.mjs

import { shopifyGraphQL, assertNoUserErrors } from './lib/shopify-admin.mjs';
import { makePlaceholderPng } from './lib/placeholder-image.mjs';

const TIERS = [
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
  for (const t of TIERS) {
    const data = await shopifyGraphQL(`query { productByHandle(handle: "${t.handle}") { id media(first: 1) { nodes { id } } } }`);
    const product = data.productByHandle;
    if (product.media.nodes.length > 0) {
      console.log(`  (${t.handle} already has an image, skipping)`);
      continue;
    }
    const png = makePlaceholderPng(600, 900, t.colors[0], t.colors[1]);
    await uploadImage(product.id, png, `${t.handle}.png`);
    console.log(`  ✔ ${t.handle}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
