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
- **Browser automation for visual QA never got a stable session** against
  the password-gated preview theme in this sandbox. I burned real time
  on it before cutting losses and relying on curl + content assertions
  (verifiably correct, but not a pixel-level check) instead of
  screenshots. Flagged in build notes as something to do properly with
  more time / a less constrained environment.

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
