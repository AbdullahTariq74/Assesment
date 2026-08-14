**To:** nj@troopod.io
**Subject:** AI Product Engineer Assignment - Abdullah Tariq

Hi,

Submission for the AI Product Engineer assignment below.

**Dev store URL:** https://purelane-dev-xxar3arp.myshopify.com
**Password:** Dracarys74@

The build lives on an unpublished theme called "Purelane (Dawn build)" so the store's default theme is untouched. Direct preview link (same password):
https://purelane-dev-xxar3arp.myshopify.com?preview_theme_id=166005965050

**GitHub repo (commit history intact):**
https://github.com/AbdullahTariq74/Assesment

All five required sections are built: Hero, Shop, Combos, Bundles, Reviews. The store is seeded with 18 products (10 individual + 5 combos + 3 bundle tiers), including the sold-out, no-image, and very-long-title edge cases, plus 5 reviews.

---

**Metafield and metaobject definitions**

Full schema with reasoning: https://github.com/AbdullahTariq74/Assesment/blob/master/docs/METAFIELDS.md

Provisioned via a scripted, reproducible Admin API flow rather than clicked by hand — see https://github.com/AbdullahTariq74/Assesment/tree/master/scripts

- Product metafields (namespace `custom`): `badge_label`, `featured`, `included_products` (list.product_reference), `bundle_perks` (list.single_line_text_field), `bundle_product_count`, `rating_average`, `rating_count`
- Metaobject `review`: `rating`, `title`, `body`, `author`, `product` (reference)

---

**Notes on the build**

What I'd flag about the original file:
- Two full `<style>` blocks — the first is a complete dark layout+palette, the second overrides only colors and wins the cascade outright. Net result is the first block's layout with the second's colors; easy to miss and ship the wrong palette.
- The Shop grid has 8 cards for only 4 unique products (two different image techniques applied to the same 4, never reconciled).
- Add-to-cart, the mobile nav drawer, and email signup are all non-functional in the source file (no form, no handler).
- The reviews marquee pauses on hover/focus, but no element inside a review card is focusable — a keyboard-only visitor had no way to stop it.

What I changed, and why:
- Combos and Bundles are real Shopify products, so price/compare-price/savings come from the platform, not Liquid math. Combos generate their "Includes: A, B & C" copy from a real product-reference metafield instead of hand-written prose.
- Reviews are a metaobject (Shopify has no native review object); documented as a stand-in for a real reviews app once one's installed.
- Add-to-cart now wraps Dawn's own `<product-form>` / AJAX cart flow instead of staying inert.
- Reused Dawn's own scroll-reveal system instead of porting a parallel one.
- Added a 3-up tablet breakpoint the Shop grid was missing, and clamped card titles to 2 lines so a long title can't break the row.
- Ran actual WCAG contrast numbers on the accent/green colors rather than eyeballing them — several small-text uses fell short of AA, so both tokens are darkened just enough to clear it (visually the same at a glance).
- Cut deliberately, for scope: the full-page animated "scenes" water/parallax background, the ticker, the scroll-progress rail, and the product rotator. All bonus per the brief, and the water cinematics specifically were a real Core Web Vitals risk for what they'd add.

What I'd do with more time:
- Wire a real reviews app instead of the metaobject stand-in.
- Build the actual "bundle picker" the source copy implies but never implements.
- A proper automated visual-regression pipeline instead of the manual checks I ended up doing.
- An actual Lighthouse/PageSpeed number — the practices are in place, but a real score needs a live, non-password-gated URL.

---

**Notes on my AI workflow**

What I delegated:
- A full read of the 1716-line prototype file to an agent, which returned a structured report (exact colors, breakpoints, JS behavior per section) that I built every section from directly.
- Store provisioning — metafield/metaobject definitions, the seed catalog, publishing to the Online Store channel, wiring real references into the template — all scripted against the Admin API instead of clicked by hand.
- A second, independent QA pass against the brief's own grading bar before calling anything done.

Where it failed me:
- Liquid syntax I was confident about was wrong more than once — chaining a filter onto a translation tag's output instead of one of its arguments, the same mistake three separate times before I caught the pattern.
- GraphQL type names recalled from memory were sometimes wrong (`InventoryItemUpdateInput` doesn't exist; the real type is `InventoryItemInput`) — needed the live API's error message to fix.
- A runtime type-coercion bug static checking is structurally blind to: assumed a filter would coerce a split string back to an integer for a size comparison; it silently didn't, and broke every product image until I actually rendered the page.
- Guessed the wrong serialization format for theme block settings twice (GID, then numeric ID) before finding that product/collection/metaobject settings all resolve by handle — there's no error when it's wrong, the setting just renders blank.
- Missed that products created via the Admin API aren't published to any sales channel by default — cost a full debugging round.
- Automated browser QA against the password-gated store didn't work at first; the fix was fetching the real page HTML and rendering it locally instead of fighting the login flow. Once I could actually see the page, that caught two real layout bugs code review alone had missed.

What I'd systematize for twenty more of these:
- A written cheat sheet of Shopify serialization gotchas (setting value formats, the publish-to-Online-Store step, GraphQL type names) so I'm not re-deriving them empirically each time.
- A render-and-check smoke test as a required step after every seed/config script, not just a final pass — `theme check` is necessary but not sufficient.
- Idempotency by default in seed scripts from the start, not bolted on after the first partial failure.

Happy to walk through any of these decisions in more depth.

Thanks,
Abdullah
