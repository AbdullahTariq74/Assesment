# Metafield & metaobject schema — Purelane build

This documents every custom data definition the five required sections rely
on. Native Shopify fields (title, price, compare_at_price, images, variants,
tags) are used wherever they cover the need — the definitions below only
exist for content the platform has no native field for.

All product metafields use the `custom` namespace (Shopify's default when a
definition is created from Admin → Settings → Custom data, or via the
Admin API without an explicit namespace). Provisioned by
`scripts/setup-metafields.mjs` (see that file for the exact API calls) —
re-run it any time against a fresh store to reproduce this schema.

## Product metafields

| Key | Type | Used by | Purpose |
|---|---|---|---|
| `custom.badge_label` | single_line_text_field | Shop, Combos | Free-text badge shown on the card ("Best seller", "New", "Most popular"...). Empty = no badge. Replaces the prototype's hardcoded `.pill`/`.flag` text. |
| `custom.featured` | boolean | Combos, Bundles | Drives the emphasized card treatment (prototype's `.hero-combo` / `.tier.best`) — bigger card, filled CTA. |
| `custom.included_products` | list.product_reference | Combos | The component products shown as the icon "stack" and used to generate the "Includes: X, Y & Z" sentence. Replaces hand-written prose in the prototype. |
| `custom.bundle_perks` | list.single_line_text_field | Bundles | Bullet list under the tier price (prototype's `<ul><li>`). |
| `custom.bundle_product_count` | number_integer | Bundles | "N products" + per-unit price math (tier price ÷ this number). |
| `custom.rating_average` | number_decimal | Shop | Star rating shown on product cards. Stand-in for a reviews app (see note below). |
| `custom.rating_count` | number_integer | Shop | Review count shown on product cards ("237 reviews"). |

Combos and Bundles are themselves real **Products** (a merchant creates a
"Kitchen Essentials" product priced at ₹499 with a ₹897 compare-at price,
same as any other product) — so price, compare price, and the "You save
₹X" math are 100% native Shopify data, computed in Liquid from
`product.price` / `product.compare_at_price`, never hardcoded. The
metafields above only cover the parts native fields don't: composition,
perks, and merchandising badges.

## Metaobject: `review`

Native Shopify has no review object, so reviews are modeled as a
metaobject type, giving merchants a real "add a review" flow in
Admin → Content → Metaobjects with zero dev involvement — no app, no code
change to add/edit/remove a review.

| Field key | Type | Purpose |
|---|---|---|
| `rating` | integer (1–5, validated) | Star count |
| `title` | single_line_text_field | Review headline |
| `body` | multi_line_text_field | Review text |
| `author` | single_line_text_field | Reviewer name |
| `product` | product_reference (optional) | Optional link to the product being reviewed |

Display name field: `title`.

The Reviews rail section references a curated set of these via
metaobject-reference blocks (one block per review) rather than pulling
every metaobject of this type — so ordering and which reviews appear on
the homepage is entirely the merchant's call in the theme editor, same as
every other section.

The header aggregate stats ("★ 4.8 from 8,000+ reviews", "Loved by 12
lakh+ homes") are curated marketing claims, not something meaningfully
computed from a handful of demo entries — they're plain text settings on
the section.

### Production note on reviews

A real reviews app (Judge.me, Loox, Yotpo, etc.) is the correct long-term
answer — it collects reviews from real buyers, moderates them, and
usually exposes its own rating metafields/snippets automatically. The
metaobject approach here exists because (a) this is a fresh dev store
with no verified orders to generate real reviews from, and (b) the
assignment asks for pixel-accurate reproduction of a specific marquee
design that a third-party app's default widget markup won't match. If
this shipped to a real store, swap the metaobject list in the Reviews
section for the app's Liquid snippet/App Block and keep everything else
(the marquee markup, the pause-on-focus fix, the mask) as-is.

The same reasoning applies to `custom.rating_average` / `rating_count` on
Shop cards — replace with whatever metafields the reviews app writes
(e.g. Judge.me writes `product.metafields.judgeme.badge`) once one is
installed.
