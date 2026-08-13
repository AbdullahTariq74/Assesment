// Provisions the metafield & metaobject definitions documented in
// docs/METAFIELDS.md. Idempotent: re-running skips any definition that
// already exists instead of erroring.
//
// Usage: node --env-file=.env scripts/setup-metafields.mjs

import { shopifyGraphQL } from './lib/shopify-admin.mjs';

const PRODUCT_METAFIELDS = [
  {
    key: 'badge_label',
    name: 'Badge label',
    description: 'Free-text badge shown on Shop/Combos cards (e.g. "Best seller"). Empty = no badge.',
    type: 'single_line_text_field',
  },
  {
    key: 'featured',
    name: 'Featured (emphasized card)',
    description: 'Drives the emphasized card treatment on Combos/Bundles (bigger card, filled CTA).',
    type: 'boolean',
  },
  {
    key: 'included_products',
    name: 'Included products',
    description: 'Component products for a Combo — drives the icon stack and the generated "Includes:" sentence.',
    type: 'list.product_reference',
  },
  {
    key: 'bundle_perks',
    name: 'Bundle perks',
    description: 'Bullet list shown under a Bundle tier\'s price.',
    type: 'list.single_line_text_field',
  },
  {
    key: 'bundle_product_count',
    name: 'Bundle product count',
    description: 'How many products this Bundle tier lets a customer pick — drives "N products" and the per-unit price math.',
    type: 'number_integer',
  },
  {
    key: 'rating_average',
    name: 'Rating average',
    description: 'Star rating shown on Shop cards. Stand-in for a reviews app metafield — see docs/METAFIELDS.md.',
    type: 'number_decimal',
  },
  {
    key: 'rating_count',
    name: 'Rating count',
    description: 'Review count shown on Shop cards.',
    type: 'number_integer',
  },
];

const METAOBJECT_DEFINITION_MUTATION = `
  mutation CreateReviewMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
    metaobjectDefinitionCreate(definition: $definition) {
      metaobjectDefinition { id type }
      userErrors { field message code }
    }
  }
`;

const METAFIELD_DEFINITION_MUTATION = `
  mutation CreateProductMetafieldDefinition($definition: MetafieldDefinitionInput!) {
    metafieldDefinitionCreate(definition: $definition) {
      createdDefinition { id name namespace key }
      userErrors { field message code }
    }
  }
`;

function isTakenError(userErrors) {
  return userErrors?.some((e) => e.code === 'TAKEN' || /already exists/i.test(e.message));
}

async function createProductMetafields() {
  for (const field of PRODUCT_METAFIELDS) {
    const data = await shopifyGraphQL(METAFIELD_DEFINITION_MUTATION, {
      definition: {
        name: field.name,
        namespace: 'custom',
        key: field.key,
        description: field.description,
        type: field.type,
        ownerType: 'PRODUCT',
      },
    });
    const { createdDefinition, userErrors } = data.metafieldDefinitionCreate;
    if (createdDefinition) {
      console.log(`✔ custom.${field.key} (${field.type})`);
    } else if (isTakenError(userErrors)) {
      console.log(`… custom.${field.key} already exists, skipping`);
    } else {
      throw new Error(`Failed to create custom.${field.key}: ${JSON.stringify(userErrors)}`);
    }
  }
}

async function createReviewMetaobject() {
  const data = await shopifyGraphQL(METAOBJECT_DEFINITION_MUTATION, {
    definition: {
      type: 'review',
      name: 'Review',
      displayNameKey: 'title',
      fieldDefinitions: [
        {
          key: 'rating',
          name: 'Rating',
          type: 'number_integer',
          validations: [
            { name: 'min', value: '1' },
            { name: 'max', value: '5' },
          ],
        },
        { key: 'title', name: 'Title', type: 'single_line_text_field', required: true },
        { key: 'body', name: 'Body', type: 'multi_line_text_field', required: true },
        { key: 'author', name: 'Author', type: 'single_line_text_field', required: true },
        { key: 'product', name: 'Product', type: 'product_reference' },
      ],
    },
  });
  const { metaobjectDefinition, userErrors } = data.metaobjectDefinitionCreate;
  if (metaobjectDefinition) {
    console.log(`✔ metaobject definition 'review' created (${metaobjectDefinition.id})`);
  } else if (isTakenError(userErrors)) {
    console.log(`… metaobject definition 'review' already exists, skipping`);
  } else {
    throw new Error(`Failed to create 'review' metaobject definition: ${JSON.stringify(userErrors)}`);
  }
}

async function main() {
  console.log('Creating product metafield definitions...');
  await createProductMetafields();
  console.log('\nCreating review metaobject definition...');
  await createReviewMetaobject();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
