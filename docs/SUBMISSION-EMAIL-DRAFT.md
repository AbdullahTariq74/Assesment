**To:** nj@troopod.io
**Subject:** AI Product Engineer Assignment - Abdullah Tariq

Hi,

Here's my submission for the AI Product Engineer assignment.

**Dev store URL:** https://purelane-dev-xxar3arp.myshopify.com
**Password:** Dracarys74@

The build is on a separate unpublished theme called "Purelane (Dawn build)", so the store's default theme hasn't been touched. Direct preview link (same password):
https://purelane-dev-xxar3arp.myshopify.com?preview_theme_id=166005965050

**GitHub repo:** https://github.com/AbdullahTariq74/Assesment (commit history is all there)

All five required sections are built: Hero, Shop, Combos, Bundles, Reviews. The store has 18 seeded products (10 individual, 5 combos, 3 bundle tiers), including the sold out, no image, and very long title cases, plus 5 reviews.

**Metafield and metaobject definitions**

I've documented the full schema and the reasoning behind it here: https://github.com/AbdullahTariq74/Assesment/blob/master/docs/METAFIELDS.md

I set these up with scripts against the Admin API instead of clicking through the admin by hand, so they're reproducible. Scripts are here: https://github.com/AbdullahTariq74/Assesment/tree/master/scripts

Quick summary: product metafields under the `custom` namespace are `badge_label`, `featured`, `included_products`, `bundle_perks`, `bundle_product_count`, `rating_average` and `rating_count`. There's also a `review` metaobject with `rating`, `title`, `body`, `author` and a product reference.

**Notes on the build**

A few things worth flagging about the original file. It actually has two full style blocks: the first is a complete dark layout and palette, and the second only overrides colors but wins the cascade outright. So what ships is the first block's layout with the second's colors, which is easy to miss if you don't read the whole thing. The shop grid also has 8 cards for only 4 unique products (two different image techniques applied to the same 4, never reconciled). Add to cart, the mobile nav drawer and the email signup are all non functional in the source file, no form or handler behind any of them. And the reviews marquee only pauses on hover or focus, but nothing inside a review card is actually focusable, so a keyboard only visitor has no way to stop it.

On what I changed and why: Combos and Bundles are real Shopify products now, so price, compare price and savings all come from the platform instead of being calculated in Liquid. Combos generate their "Includes: A, B & C" line from a real product reference metafield rather than hand written copy. Reviews are a metaobject since Shopify has no native review object, and I've noted it as a stand in for a proper reviews app later. Add to cart now actually works, wired into Dawn's own product form and cart flow instead of just sitting there. I reused Dawn's existing scroll reveal system instead of writing a second one. I added a 3 up tablet breakpoint the shop grid was missing, and clamped card titles to two lines so a long title can't break the layout. I also ran actual contrast numbers on the accent and green colors instead of just eyeballing them, a few of the smaller text uses fell short of AA, so I darkened both slightly to pass (barely noticeable visually). And I deliberately cut the full page animated background, the ticker, the scroll progress rail and the product rotator since they're all bonus scope, and the animated background in particular would have been a real hit to performance for what it adds.

With more time, I'd wire up a real reviews app instead of the metaobject stand in, build the actual bundle picker the source copy implies but never implements, set up a proper automated visual regression pipeline instead of the manual checks I did, and get an actual Lighthouse score once the store isn't behind a password wall.

**Notes on my AI workflow**

I had an agent read through the whole 1716 line prototype file once and hand back a structured report of exact colors, breakpoints and JS behaviour per section, and built every section from that instead of going back to the source file each time. Store setup (metafields, seed catalog, publishing everything to the Online Store channel, wiring real data into the template) was all scripted against the Admin API rather than done by hand. And I ran a second independent QA pass against the brief's own bar before calling anything finished.

Where it actually went wrong: Liquid syntax I was confident about turned out wrong more than once, chaining a filter onto a translation tag's output instead of one of its arguments, same mistake three times before I caught it. GraphQL type names from memory were sometimes off too (InventoryItemUpdateInput doesn't exist, it's InventoryItemInput) and needed the live API's error to sort out. There was a runtime type coercion bug that static checking just can't see: I assumed a filter would turn a split string back into an integer for a size comparison, it silently didn't, and it broke every product image until I actually rendered the page and looked. I also guessed the wrong format for theme block settings twice before finding they resolve by handle, not GID or numeric ID, and there's no error when it's wrong, the setting just quietly renders blank. I missed that products created through the Admin API aren't published to any sales channel by default, which cost a whole debugging round. And automated browser testing against the password protected store didn't work at first, so instead of fighting the login flow I just fetched the real page HTML and rendered it locally, which is what let me actually catch two real layout bugs that code review alone had missed.

If I had to do twenty more of these, I'd want a written cheat sheet of Shopify quirks like this so I'm not rediscovering them each time, a render and check step built into every seed script instead of only at the end, and idempotency in seed scripts from the start rather than added after the first failure.

Happy to talk through any of this in more detail.

Thanks,
Abdullah
