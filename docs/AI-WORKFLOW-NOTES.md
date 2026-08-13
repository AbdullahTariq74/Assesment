# AI workflow notes

## What I delegated

- **Reading the 1716-line prototype file.** Instead of loading the whole
  thing into my own working context repeatedly, I had an agent read it
  end-to-end once and return a structured report: exact hex values,
  every breakpoint, JS behavior per section, accessibility gaps. That
  report is `docs/PROTOTYPE-ANALYSIS.md` and I built every section
  directly from it rather than re-reading the source file each time.
- **Provisioning the store.** Metafield/metaobject definitions, an
  18-product seed catalog with deliberate edge cases (sold out, no
  image, long title), publishing everything to the Online Store channel,
  and writing real references into the homepage template — all scripted
  against the Admin API (`scripts/`) rather than done by hand in the
  admin UI.
- **A QA pass against the assignment's own grading bar** (theme-editor
  safety, accessibility, reduced motion, Core Web Vitals, merchant
  editability, correctness) as a second, independent read of the
  finished code before calling it done.

## Where it failed me

- **Liquid syntax I was confident about was wrong**, repeatedly, in ways
  static checking didn't catch every time: chaining filters onto a
  translation tag's *output* instead of onto one of its named arguments
  (`{{ 'x' | t: amount: a | minus: b | money }}` doesn't do what it
  looks like it does — the same bug, three separate times, before I
  caught the pattern). `theme check` caught the outright syntax errors;
  it can't catch a filter-precedence mistake that's still valid Liquid.
- **GraphQL type names from memory were unreliable** —
  `InventoryItemUpdateInput` doesn't exist, the real type is
  `InventoryItemInput`. Had to hit the live API and read the actual
  error to fix it. Anything with a specific schema (GraphQL types,
  exact mutation shapes) needs verifying against the real API, not
  recalled.
- **A runtime type-coercion bug static checking is structurally blind
  to.** I assumed `"165" | strip | plus: 0` would coerce a split-string
  back to Integer for a size comparison. It silently didn't, and broke
  every product image on the live page — `theme check` is static
  analysis, it has no way to catch a filter behaving differently than
  documented at runtime. Only caught it by rendering the actual page and
  reading the Liquid error in the HTML.
- **Guessed the wrong serialization format for theme block settings,
  twice**, before landing on the right one — tried GID, then numeric
  legacy ID, before "product"/"collection"/"metaobject" setting types
  all turned out to resolve by *handle*. There's no error when this is
  wrong; the setting just silently renders blank, so it took rendering
  the live page and grepping for expected content each time to find out
  it hadn't worked.
- **Missed that API-created products aren't published to any sales
  channel by default.** Everything referenced correctly (once handles
  were right) but rendered as empty-state until I found this via a
  GraphQL introspection query — cost a full debugging round that a
  documented gotcha would have skipped entirely.
- **Browser automation against the password-gated preview theme never
  got a stable session** in this sandbox — cookies that worked fine in
  curl didn't carry the same way through the headless browser's own
  redirect handling. I initially cut my losses and shipped on
  curl + content assertions alone (verifiably correct, but not a
  pixel-level check). When asked directly to close that gap, the actual
  fix wasn't to keep fighting the auth flow: fetch the real rendered
  HTML with curl (which worked reliably), rewrite its protocol-relative
  URLs to absolute, and load *that* into the headless browser instead of
  asking it to authenticate against Shopify itself. Once I could
  actually see the page, I immediately found two real bugs code review
  had missed — a grid miscounting its own children (3 items into a
  2-column `1fr auto` grid) that put the hero heading and product image
  on the wrong sides of the page, and a background color seam between
  Hero and Reviews that isn't visible in either section's CSS in
  isolation, only in how they sit next to each other. Both are exactly
  the class of bug that only exists at the render step — no amount of
  re-reading the CSS would have surfaced either one. The lesson isn't
  "browser tooling is unreliable," it's that I should have tried a
  second access strategy before concluding the check wasn't possible.

## What I'd systematize for the next 20 of these

- **A cheat sheet of Shopify serialization gotchas**, written once and
  reused: JSON-template setting value formats by type (handle vs. ID vs.
  GID), the publish-to-Online-Store step, GraphQL type names for the
  mutations I actually use. I re-derived all of this empirically this
  session against a live API; it shouldn't cost that again next time.
- **A render-and-grep smoke check as a required step after every seed
  or template-config script**, not just a final pass. `theme check` is
  necessary but not sufficient — it would not have caught either the
  srcset coercion bug or the reference-format bugs, both of which only
  showed up by actually rendering the page.
- **Idempotency by default in any seed script**, not added after the
  first failure. I added title-based dedup to the seed script only
  after it died partway through on a missing API scope — should be the
  starting shape, not a patch.
- **"Fetch real HTML, render it locally" as the default visual-QA
  strategy for any gated/staging environment**, not a last resort.
  Fighting a headless browser's cookie jar against a password wall
  cost real time before I tried the much simpler workaround; next time
  that's the first thing I reach for, not the third.
