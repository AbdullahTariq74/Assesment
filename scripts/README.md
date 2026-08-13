# Store provisioning scripts

One-off Admin API scripts used to provision this dev store from a clean
Shopify install. Not part of the theme itself — nothing here ships to
production; it's how the seed data in the deliverable was produced, kept
so it's reproducible against a fresh store rather than hand-clicked.

All scripts read `SHOPIFY_STORE` / `SHOPIFY_ADMIN_TOKEN` / `SHOPIFY_API_VERSION`
from a local `.env` file (gitignored — never commit it) via Node's built-in
`--env-file` flag, so nothing needs installing:

```
node --env-file=.env scripts/<script>.mjs
```

The `.env` file needs a custom app access token with these Admin API
scopes: Products (read/write), Metaobjects + Metaobject definitions
(read/write), Content (read/write, fallback for metaobjects), Locations
(read), Inventory (read/write), Themes (read/write).

## Run order (on a fresh store)

1. **`setup-metafields.mjs`** — creates the product metafield definitions
   and the `review` metaobject definition documented in
   [`docs/METAFIELDS.md`](../docs/METAFIELDS.md). Idempotent: safe to
   re-run, skips anything that already exists.
2. **`seed-products.mjs`** — creates the catalog: 10 individual products
   (Shop grid, including the sold-out / no-image / long-title edge
   cases), 5 combo products, 3 bundle-tier products, a "Shop — Best
   sellers" collection, and 5 review metaobjects. Also idempotent by
   product title, so a run that fails partway (e.g. on a missing scope)
   can just be re-run.
3. **`add-tier-images.mjs`** — adds a placeholder image to the 3 bundle
   tier products (run separately since they're created without one in
   step 2 — they're referenced by the Hero carousel's price-source slot
   and look better with an image than Dawn's generic placeholder icon).
4. **`publish-to-online-store.mjs`** — publishes every product/collection
   to the "Online Store" sales channel. **Required** — products and
   collections created via the Admin API are not published to any
   channel by default, so without this step they exist in Admin but are
   invisible to storefront rendering even when correctly referenced from
   a theme block.
5. **`fetch-handles.mjs`** — prints every product/collection/review
   handle, needed for step 6 (Shopify's JSON template `product` /
   `collection` setting types store the resource's *handle*, not its ID
   or GID — `metaobject`-type block settings also resolved via handle in
   testing, not the GID one might expect).
6. **`configure-homepage.mjs <theme_id>`** — writes the real
   product/collection/review references into the live theme's
   `templates/index.json` via the Admin REST Asset API, and updates the
   local copy of that file to match (so it's what's committed to git).

`inspect-asset.mjs <theme_id>` is a read-only helper for checking exactly
what's currently stored on a theme asset — useful when debugging why a
block reference isn't resolving.

## What surprised me building this

- New products/collections aren't published to any sales channel by
  default via the Admin API — this silently blocked every section that
  referenced one until `publish-to-online-store.mjs` existed.
- `product` / `collection` JSON-template settings resolve by handle, not
  GID or legacy numeric ID (both of the latter silently fail to resolve
  — no error, the setting just renders blank).
- A Shopify preview URL's `?preview_theme_id=` redirects to a clean URL
  on the next request; the preview state survives in a session cookie,
  not the query string. Looks like a broken link if you only check the
  URL bar or don't carry cookies across requests.
