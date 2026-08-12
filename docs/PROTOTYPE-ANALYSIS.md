# Purelane Homepage Prototype — Structural Analysis
Source: `purelane-homepage.html` (1716 lines, single file, no external deps except Google Fonts).
Read in full (lines 1–1716) via direct line-range reads. This document is the reference for rebuilding as Dawn-theme Liquid sections.

---

## 0. Document skeleton (top to bottom)

| Lines | Content |
|---|---|
| 1–11 | `<head>` meta, title, Google Fonts `<link>` (preconnect x2 + stylesheet) |
| 12–633 | `<style>` block #1 — "V1": base structure, layout, spacing, all grid/flex rules, animations/keyframes, and a **dark ocean/jewel-tone palette** |
| 634–823 | `<style>` block #2 — "V2": comment says `VERSION 2 - BRAND COLOURS (light)`. Redeclares `:root` and overrides colors/gradients/shadows only (no layout). **This is the block that actually wins on screen** — see §0.1 |
| 825 | `<body>` opens |
| 826–885 | `.scenes` — fixed full-viewport background layer: 4 gradient "scene" divs + SVG water/light/bubble decoration (huge inline SVGs, purely decorative, `aria-hidden="true"`) |
| 887–899 | `.ticker` — scrolling marquee strip (4 messages, duplicated once for seamless loop) |
| 902–930 | `<header id="hdr">` — nav pill (logo, nav links, search/account/cart/burger icons) |
| 932–940 | `<nav class="rail">` — fixed right-side scroll-progress dots (desktop ≥1180px only) |
| 942 | `<main id="top">` opens |
| 945–997 | **`section.hero`** (`data-scene="1"`) |
| 1000–1011 | **`section#reviews.revband`** (`data-scene="1"`) — auto-scrolling review marquee |
| 1014–1103 | `section#ingredients` (`data-scene="2"`) — 5 ingredient icons |
| 1106–1135 | `section#how` (`data-scene="2"`) — 3 "pillars" |
| 1138–1177 | `section#proof` (`data-scene="3"`) — claim + auto-rotating product image + 4 stat rings |
| 1181–1193 | **`section#combos`** (`data-scene="3"`) — horizontal scroll-snap rail of combo cards |
| 1196–1245 | **`section#bundles`** (`data-scene="3"`) — 3 pricing tiers |
| 1248–1432 | **`section#shop`** (`data-scene="3"`) — product grid ("shelf") |
| 1436–1450 | `section#range` (`data-scene="3"`) — horizontally scrollable strip of all 10 product silhouettes |
| 1454–1464 | `section#whybundles` (`data-scene="4"`) — 4 value props |
| 1467–1475 | `section#categories` (`data-scene="4"`) — 4 bundle-category link cards |
| 1478–1499 | `section` (unnamed, `data-scene="4"`) — trust bar, 4 items |
| 1502–1514 | `section` (unnamed, `data-scene="4"`) — email signup |
| 1516 | `</main>` |
| 1519–1559 | `<footer>` — 4-column footer + bottom bar |
| 1562–1565 | `.sticky` — fixed mobile-only sticky CTA bar |
| 1567–1714 | `<script>` — single IIFE, all page JS (see §0.4) |

**Full top-level section order (11 named `<section>`s + hero, in document order):** hero → reviews → ingredients → how → proof → combos → bundles → shop → range → whybundles → categories → trust(unnamed) → signup(unnamed). Everything after `bundles`/`shop` (range, whybundles, categories, trust, signup) is "bonus" scope beyond the 5 required sections.

### 0.1 Critical finding: two cascading `<style>` blocks, not a theme toggle
There is **no JS or class-based switch** between "V1" and "V2" — both `<style>` blocks are always active, loaded in document order. Because CSS cascade resolves ties by source order, **every property V2 redeclares wins outright**, permanently shadowing V1's version. There's no toggle to preserve; only one rendered result exists.
- V1 defines **all layout**: grid/flex structure, spacing, `clamp()` type sizes, keyframes, breakpoints. None of this is touched by V2.
- V2 redeclares `:root` custom properties (`--ink`, `--paper`, `--accent`, `--surface`, `--g-bg`, etc.) and then patches specific selectors' `background`, `border`, `box-shadow`, `color`, `filter` — i.e. only the **palette/skin**, never geometry.
- Net effect actually rendered = **V1's structure + V2's light "brand colours" skin**. The V1 dark "ocean" gradient palette (lines 67–70, 660–664 dark variant... actually 660-664 IS the light one) is fully inert dead code as far as final rendered colors go, but you should keep the CSS custom-property *names* (`--ink/--paper/--accent/--surface/--brand/--brand-lt/--accent-2`) as your Liquid/theme-settings color tokens since the layout math depends on them existing.
- **Also dead/orphaned:** lines 779–822 are a block headed `/* PDP in brand colours */` styling classes (`.crumb`, `.gal-main`, `.thumb`, `.vopt`, `.qty`, `.pin`, `.reassure`, `.acc`, `.vb`, `.ins`, `.tx`, `.cmp`, `.rscore`, `.rbar`, `.stickybuy`) that **do not exist anywhere in this HTML file**. This is leftover CSS for a Product Detail Page prototype that isn't part of this document — do not port it into the homepage sections; it belongs (if anywhere) in a product-template stylesheet.
- **Duplicate/conflicting rule:** `.proof{grid-template-columns:...}` is declared twice, once at line 374 (`1fr` → `.86fr 1.14fr` at ≥900px, gap 34px) and again at line 506–507 (`1fr` → `1.05fr .62fr` at ≥900px, gap 30px, `align-items:center`). The second (508) wins. Pure copy-paste leftover.

### 0.2 Global color palette (all distinct hex values, deduped, with role)
**Design tokens (`:root`, redefined by V2 — V2 values are what renders):**
| Token | V1 (dead) | V2 (live) | Role |
|---|---|---|---|
| `--ink` | `#17102b` | `#f4f0fb` | page background |
| `--deep` | `#241a3d` | `#e2daf3` | unused elsewhere directly |
| `--brand` | `#4b3a8f` | `#4b3a8f` (same) | purple/indigo brand |
| `--brand-lt` | `#6b55b8` | `#6b55b8` (same) | lighter brand purple |
| `--paper` | `#ece6f7` | `#241a3d` | body text color |
| `--paper-2` | `rgba(236,230,247,.74)` | `rgba(36,26,61,.78)` | secondary text |
| `--paper-3` | `rgba(236,230,247,.52)` | `rgba(36,26,61,.56)` | tertiary/muted text |
| `--accent` | `#f0a03c` | `#b8701c` | orange/amber CTA accent |
| `--accent-2` | `#c9761d` | `#c9761d` (same) | secondary accent (gradient partner) |
| `--surface` | `#faf7fd` | `#17102b` | heading color |

**Live "brand green" accent used in many V2 overrides (not a `:root` var — hardcoded repeatedly):** `#4f7d10` (icons, kickers, footer h5, star colors on some elements) and `#7a9c1e` (review stars/agg text). These should become a `--brand-green` token — currently duplicated as literal hex ~15 times (lines 717, 727, 728, 730, 734, 735, 738, 743, 745, 748, 758, 775, 781, 790, 792, 798, 800, 803, 807, 811, 814).

**Other recurring live hex values:** `#b8701c` (accent, ~15 occurrences), `#00706a`/`#004b46` (btn-primary gradient, teal), `#f4fdf6` (btn text on teal), `#01423b` (input text), `#0d5b52` (ingredient icon stroke).

**V1 "ocean" scene gradients (dead — background layer colors, lines 67–70):** `#1ea38d,#0b8578,#017069,#4b3a8f,#01524e,#12907f,#04756e,#01514d,#067c71,#00625d,#014e4a,#023c39,#036359,#014b46,#013431,#012422`.

**V2 "sunlit water" scene gradients (live, lines 661–664):** `#fbfffb,#eafaec,#d6f1dc,#bfe8ca,#f6fdf7,#e3f7e7,#cbedd4,#b2e2c2,#f0fbf2,#d9f2df,#bde6c8,#a2d9b6,#e9f8ec,#cdedd6,#addcbe,#8ecdaa`.

**Product SVG illustration colors** (inline, per-bottle, all in the `--p-*` base64 SVGs and the 4 hand-drawn shop-card bottle SVGs): purples ranging `#4b3a8f → #5a46a3 → #554299 → #6250ad → #6b55b8 → #7a62c2 → #8168c9 → #8f74d4`, plus SVG-internal gradient stops `#04756e/#4b3a8f/#013f3d` (bottle body), `#8fa89b/#eef6ef/#7d938c` (cap), `#01201c` (shadow ellipse), `#f0a03c` (leaf logo mark inside label), `#faf7fd`/`#ece6f7` (label text). Meta `theme-color` = `#eee7fb` (line 8).

### 0.3 Fonts
- Google Fonts `<link>` (line 9–11): **Outfit** weights 500/600/700/800, **Inter** weights 400/500/600/700, loaded via standard `<link rel="preconnect">` + `<link href="...css2?family=...">` — no self-hosted `@font-face`, no font-display override beyond the built-in `&display=swap`.
- `body` font: `'Inter', system-ui, -apple-system, sans-serif` (line 37).
- Display/heading font: `'Outfit', system-ui, sans-serif` used for `.d1–.d4` and every `h3/h4/h5` that needs weight (uppercase, tight tracking, `font-weight:800` for `.d1/.d2`, `700` for smaller).
- **Shopify implication:** swap the Google Fonts `<link>` for Dawn's font-picker / `font_face` Liquid filters bound to theme settings (`settings.type_header_font`, `settings.type_body_font`), and never hardcode Google Fonts URLs in production.

### 0.4 Global spacing/sizing scale
- `--r:26px` (large radius, used on `.glass`), `--r-sm:16px` (declared but never referenced elsewhere), `--maxw:1180px` (content max-width via `.wrap{max-width:var(--maxw);padding:0 18px}`), `--sec-y:34px` (vertical rhythm between sections, dropped to `22px` under 760px — line 598).
- Heading sizes are all `clamp()`-based: `.d1{clamp(48px,8.6vw,112px)}`, `.d2{clamp(30px,4.6vw,54px)}`, `.d3{clamp(21px,2.5vw,30px)}`, `.d4{clamp(16px,1.6vw,19px)}`, body `.lede{clamp(15px,1.35vw,17.5px)}` — no fixed px type scale; fully fluid.
- Card/tile radii cluster around **14–22px** (`.card .shot` 14px, `.rcard` 18px, `.cat` via `.glass` 26px, `.tier`/`.combo` via `.glass` 26px, `.tag`/pills `999px` fully round).
- Grid gaps cluster at **14px** (shop/tiers/combos rail) and **16–34px** for section-level grids.

### 0.5 Root-level breakpoints (every distinct px value used in a media query, whole document)
`420, 600, 640, 720, 760, 820, 860, 880, 900, 901, 960, 1024, 1040, 1180, 1200` (all `px`), plus `@media(prefers-reduced-motion:reduce)`. No `em`-based queries. Note **900 vs 901** and **960 vs 960** are used as paired min/max boundaries in a couple of places (e.g. `.badges` hidden `max-width:900px` / `.badgestrip` hidden `min-width:901px`) — clean complementary pairs, but worth normalizing to a single breakpoint scale (e.g. Dawn's default 750/990px) rather than porting 15 bespoke values verbatim.

### 0.6 Global JS (inline `<script>`, lines 1567–1714, one IIFE, no libraries)
All behavior is vanilla JS, no build step, no external script tags anywhere in the file (only the Google Fonts `<link>`).
1. **Reduced motion gate** (line 1569): `var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;` — read once at load, referenced by every animated feature below.
2. **Scroll-reveal (`.rv` → `.rv.in`)** (1572–1580): `IntersectionObserver` with `rootMargin:'0px 0px -12% 0px', threshold:0.12`; adds `.in` once then `unobserve`s. Falls back to immediately adding `.in` to all if no IO or reduced motion.
3. **Scene crossfade** (1582–1601): walks all `[data-scene]` elements, computes each one's absolute offsetTop by walking `offsetParent` chain, and on scroll picks the highest-numbered scene whose zone top is above the viewport's vertical midpoint — toggles `.scene.on` and sets `data-d` on `#scenes`. This drives the background gradient + water-opacity depth response (`.scenes[data-d="1..4"] .water{opacity:...}`).
4. **Rail sync** (1604–1610): mirrors the same "highest section above midpoint" logic for the right-side progress-dot `nav.rail`.
5. **Parallax + header shrink** (1613–1636): single `requestAnimationFrame`-throttled `frame()` run on scroll/resize (and mousemove ≥1024px): toggles `header.up` past `scrollY>90` (shrinks nav pill top offset via CSS `top:38px→10px`), applies `--px/--py` CSS custom properties to each `.wl` water layer for parallax drift, and directly sets inline `transform`/`opacity` on `#heroProd` based on scroll fraction (`y/700` clamped) for a scroll-linked hero-product fade/scale/translate.
6. **Ambient hero-product shadow pulse** (1650–1657): uses the **Web Animations API** (`prod.animate([...], {duration:7000, iterations:Infinity})`) to breathe the `drop-shadow` filter — skipped entirely if `reduce`.
7. **Hero product-stage carousel** (1660–1682) — see Hero section detail below.
8. **"Why it works" product rotator** (1685–1710) — see Proof section (adjacent to Combos, not one of the 5 required, but shares the pattern).
All listeners are `passive:true` where applicable; no click delegation framework, no cart/AJAX calls anywhere (Add-to-cart buttons and the email form are non-functional stubs — see §ready-for-Shopify notes per section).

### 0.7 `<style>`/`<script>` block locations
Exactly **2** `<style>` blocks, both in `<head>` (lines 12–633 and 634–823), and exactly **1** `<script>` block, at the very end of `<body>` (1567–1714). No per-section inline `<style>` blocks; a handful of one-off inline `style="..."` attributes appear throughout (see prototype-issues notes per section) but they're presentational tweaks (margins), not structural.

---

## 1. HERO — `section.hero` (lines 945–997)

### Structure
```html
<section class="hero" data-scene="1">
  <div class="hero-grid">
    <div class="badges glass-2" aria-label="Product promises">  <!-- desktop-only side rail, 3 x .badge -->
    <div class="hero-copy">
      <h1 class="d1 rv in">Clean<br>That<br><span class="lime">Lasts</span></h1>
      <div class="rule rv rv-d1">...</div>                       <!-- decorative divider -->
      <p class="lede rv rv-d2">...</p>
      <div class="hero-cta rv rv-d3">
        <a class="btn btn-primary" href="#shop">Shop now <svg.../></a>
        <a class="btn btn-ghost" href="#how">How it works</a>
      </div>
      <div class="badgestrip rv rv-d4">...</div>                 <!-- mobile-only, 3 x .glass-2 chip -->
    </div>
    <div class="hero-prod" id="heroProd">
      <div class="hstage" id="hstage">
        <div class="hslide hs1 on" data-n="1">...single bottle + ptag...</div>
        <div class="hslide hs2" data-n="2">...two bottles + ptag...</div>
        <div class="hslide hs3" data-n="3">...three bottles + ptag...</div>
      </div>
      <div class="hdots" id="hdots">3 buttons</div>
    </div>
  </div>
</section>
```
Note: `.hero h1` starts already `rv in` (visible immediately, not scroll-revealed) while the rest of the copy uses staggered `.rv-d1..d4` reveal delays (line 964 vs 965–991).

### Content inventory
- H1: "Clean That **Lasts**" (static marketing copy — merchant-editable heading, good candidate for a section setting/block text field).
- Lede paragraph (static copy, line 970).
- 2 CTAs: "Shop now" → `#shop`, "How it works" → `#how` (both **anchor links to in-page sections**, not real product/collection URLs — must become `{{ section.settings.cta_link }}` pointing at a real collection/page in Shopify).
- 3 desktop side badges + 3 mobile badge-strip chips, duplicated content ("Plant powered", "Kids & pets safe", "Zero harsh chem") — each is inline SVG icon + 2-line label, **hardcoded text and SVG**, no image assets.
- **Hero product stage** (line 994, one very long line): 3 slides showing 1/2/3 "products" with **price tags**:
  - Slide 1: `Single bottle` — `₹200` struck `₹299`, badge `33% off`.
  - Slide 2: `Any 2 products` — `₹349` struck `₹598`, badge `Save ₹249`.
  - Slide 3: `Any 3 products` — `₹499` struck `₹897`, badge `Save ₹398`.
  - Product images are **CSS classes** (`p-kbtl`, `p-tbtl`, `p-mbtl`) pointing at `--p-*` CSS custom properties holding **base64-encoded inline SVG placeholder bottle silhouettes** (defined once globally at lines 251–265) — these are stand-in shapes, not real product photography. `aria-label` values on the `<span role="img">` describe real products ("Purelane foaming kitchen cleaner spray bottle" etc.) — **these prices/discounts/product identities are exactly the kind of data that must come from live Shopify products/variants**, not be hardcoded in Liquid.
- `.hdots`: 3 carousel dot buttons, `aria-label="Show 1/2/3 product(s)"`.

### CSS (relevant rules, all from `<style>` #1 unless noted; colors are V2-live where overridden)
- `.hero{position:relative;z-index:2;min-height:100svh;display:flex;align-items:flex-end;padding:150px 0 var(--sec-y)}` (line 207) — uses `100svh` (small viewport height) for mobile URL-bar safety.
- `.hero::before` gradient overlay for text-legibility over the background photo/scene (line 208–209), with a **different, steeper gradient** under `max-width:900px` (line 210–211) and a **light-mode replacement** in V2 (line 691–693).
- `.hero-copy{max-width:600px}` → `470px` at ≤1200px (line 224) → `none` at ≤900px (line 229).
- `.hero-prod{position:absolute;right:2%;bottom:28px;width:min(50vw,560px)}` (221) → `min(44vw,440px)` at ≤1200px (225) → becomes **static/stacked** (`position:relative;...width:min(88vw,420px);margin:20px auto 0`) at ≤900px (230) → `min(92vw,360px)` at ≤420px (624). **Hardcoded `right:2%` / viewport-relative widths mixed with px caps — needs converting to Dawn's responsive image/media grid rather than absolute positioning.**
- `.hstage{height:clamp(380px,74svh,680px)}` → `clamp(300px,44svh,430px)` at ≤900px (329). Height-driven sizing; width derives from each product's `aspect-ratio` custom property (comment at line 284–285 explicitly documents this).
- `.hslide{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity .85s var(--ease)}` / `.hslide.on{opacity:1}` — crossfade between slide states.
- `.hp{opacity:0;transform:translateY(28px) scale(.94);transition:opacity .8s var(--ease),transform .8s var(--ease)}` with staggered per-item delays `.hp.d1{.06s} .hp.d2{.30s} .hp.d3{.54s}` (296–298) — cascading pop-in when a slide becomes active.
- `.ptag` price flag: `position:absolute;left:0;bottom:2%;border-radius:16px;max-width:52%` with its own delayed fade/slide-in transition (`transition-delay:.62s`, line 313) so it appears after the bottles.
- `.badges` (desktop side rail): `position:absolute;right:18px;top:50%;transform:translateY(-50%);width:96px` (234), hidden `max-width:900px` (242).
- `.badgestrip` (mobile only): flex row of 3, hidden `min-width:901px` (248); at `max-width:420px` font drops to 8px and icon to 16px (622–623).
- Breakpoints touching hero specifically: **900px, 1200px, 420px** (plus the reduced-motion query globally).

### Animation / JS tied to this section
- Reveal cascade via `.rv`/`.rv-d1..d4` + global IntersectionObserver (see §0.6.2).
- **Hero product-stage carousel** (script lines 1660–1682):
```js
var hstage = document.getElementById('hstage');
if (hstage) {
  var hs = [].slice.call(hstage.querySelectorAll('.hslide'));
  var hd = [].slice.call(document.querySelectorAll('#hdots button'));
  var hi = 0, htimer = null;
  function hgo(n) { hi = (n + hs.length) % hs.length;
    hs.forEach(function (s, i) { s.classList.toggle('on', i === hi); });
    hd.forEach(function (d, i) { d.classList.toggle('on', i === hi); }); }
  function hplay() { if (!htimer && !reduce) htimer = setInterval(function () { hgo(hi + 1); }, 3800); }
  function hstop() { if (htimer) { clearInterval(htimer); htimer = null; } }
  hd.forEach(function (d, i) { d.addEventListener('click', function () { hstop(); hgo(i); hplay(); }); });
  hstage.addEventListener('mouseenter', hstop);
  hstage.addEventListener('mouseleave', hplay);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? hplay() : hstop(); }); }, { threshold: 0.2 }).observe(hstage);
  } else { hplay(); }
}
```
Auto-advances every 3800ms, pauses on hover and when scrolled out of view, resumes 3800ms after manual dot click. Respects `reduce` (never auto-plays if reduced-motion).
- Also driven by the page-level `frame()` parallax loop (§0.6.5): `#heroProd` gets inline `transform`/`opacity` set directly via JS on every scroll frame (mouse-parallax + scroll-fade), **in addition to** its own internal carousel — two independent animation systems act on nested elements of the same component.

### Accessibility issues
- `.hp` and product spans use `role="img"` on a `<span>` with a background-image (no real `<img>`), relying entirely on `aria-label` — acceptable pattern but fragile (no `alt` fallback if CSS fails to load; content is literally invisible without CSS since these are `background-image` pseudo-images, not `<img>`).
- Burger menu button (`.burger`, line 927) has no `aria-expanded`/`aria-controls` and no visible mobile nav panel exists anywhere in the file — the mobile menu is **non-functional in this prototype** (button present, no drawer, no JS handler).
- Cart icon button shows a "0" count badge but has no `aria-live` region to announce cart updates.
- `.hdots` buttons have `aria-label="Show 1/2/3 product(s)"` (good) but rely purely on color (`.on{background:var(--accent)}`) to indicate active state — no `aria-current`/`aria-pressed`.
- Hero background scene layer and water SVGs are correctly `aria-hidden="true"`, good.
- Reduced-motion is well handled globally (`@media(prefers-reduced-motion:reduce)` at line 627 zeroes all animation/transition durations) — one of the stronger a11y aspects of this file.
- Color contrast: `.lede`/`.body-s` use `--paper-2`/`--paper-3` (translucent) text over photographic/gradient backgrounds — contrast will vary by scroll position/background image and should be spot-checked against WCAG AA once real hero photography replaces the placeholder gradient.

### Prototype-only issues
- Hero product images are **base64 SVG silhouettes**, not real product photography — must be swapped for Shopify CDN image URLs (`{{ product.featured_image | image_url }}`), and the whole `--p-*` custom-property + `.pimg`/`aspect-ratio` system should be replaced by real `<img>`/`<picture>` with `srcset`.
- Prices (`₹200/₹299`, `₹349/₹598`, `₹499/₹897`) and "% off"/"Save ₹" badges are **hardcoded strings** — must be computed from `product.price`, `product.compare_at_price` via Liquid, or from a bundle app's data.
- `.hero-prod` uses `position:absolute` with viewport-relative `right:2%`/`width:min(50vw,560px)` — works for this fixed 3-slide composition but is not a reusable, content-driven layout; a Dawn rebuild should use a standard media/text split section with responsive `<img>` rather than absolute-positioned percentage offsets.
- CTA hrefs are anchors into the same document (`#shop`, `#how`) — fine for Shopify if the target sections exist on the same page, but should be theme-editor-configurable link settings, not hardcoded.
- No real mobile nav drawer behind the burger icon — needs to be built from scratch (Dawn's default `header-drawer` component can supply this).

### Reusability
Not a repeating card grid itself, but its **`.ptag` price-flag component** (label / current price / struck price / "X% off or Save ₹Y" pill) is structurally identical to the price block in `.combo .prow` and `.card .pr` and `.tier .price` — this should become **one Liquid snippet** (`price-badge.liquid` or similar) parameterized by price/compare-price, reused across Hero, Shop, Combos, and Bundles.

---

## 2. SHOP / PRODUCT GRID — `section#shop` (lines 1248–1432)

### Structure
```html
<section class="sec" id="shop" data-scene="3">
  <div class="wrap">
    <div class="panel-head rv">...kicker/h2/rule...</div>
    <div class="shelf">
      <article class="glass card rv">
        <div class="shot"><span class="pill">Best seller</span><span class="pimg p-tap" role="img" aria-label="..."></span></div>
        <h4>Tap cleaner &amp; limescale remover</h4>
        <div class="rate"><b>★ 4.8</b> · 237 reviews</div>
        <div class="pr"><strong>₹200</strong><s>₹299</s><em>33% off</em></div>
        <button class="btn btn-ghost btn-sm">Add to cart</button>
      </article>
      <!-- ...8 articles total... -->
    </div>
  </div>
</section>
```

### ⚠ Key finding: 8 cards, only 4 unique products — duplicated with two different image techniques
The `.shelf` grid contains **8 `<article class="glass card">` elements**, but they represent only **4 distinct products**, each appearing **twice**:
1. Cards 1–4 (lines 1259–1286) render the product image as `<span class="pimg p-tap|p-kitchen|p-metal|p-wm">` — the same lightweight CSS-background-image placeholder technique used everywhere else in the file.
2. Cards 5–8 (lines 1287–1429) render the **same 4 products again, same order, same copy, same prices, same review counts** (verified identical: "Tap cleaner..." 237 reviews at both 1262 and 1320; "Kitchen cleaner..." 254 reviews at both 1269 and 1357; "Copper, bronze & brass..." 231 reviews at both 1276 and 1394; "Washing machine..." 183 reviews at both 1283 and 1426) but with a **fully hand-built inline `<svg viewBox="0 0 130 200">` bottle illustration** (gradients, label text via `<text>`, highlight strokes) instead of the CSS class.

This reads as two competing visual-treatment experiments for "what a shelf product image should look like" that were never reconciled — **ship one, not both**. Given Shopify will use real photography, both placeholder approaches are moot for production, but you must not port 8 cards into the section — the real section should render **N cards from a collection**, most likely showing 4 in the first viewport row (2x4 desktop grid per the CSS).

### Content inventory (per unique product, x4)
- `.pill` badge: `Best seller` / `Best seller` / `Top rated` / `New` — **merchandising badges, should be a metafield or tag-driven Liquid conditional**, not hardcoded per card.
- `<h4>` title — real product name, e.g. "Tap cleaner &amp; limescale remover" — **must come from `product.title`**.
- `.rate`: `★ 4.8 · 237 reviews` — **hardcoded star rating + review count**; in production this must be wired to a reviews app (Judge.me/Loox/etc.) via its Liquid snippet, not static text.
- `.pr`: current price `₹200`, compare-at `<s>₹299</s>`, and a computed `<em>33% off</em>` badge — **all three must be Liquid-computed from `product.price` / `product.compare_at_price`**, not string literals. Currency symbol `₹` is hardcoded — must use `{{ price | money }}` so it respects the shop's currency/locale settings.
- `<button class="btn btn-ghost btn-sm">Add to cart</button>` — **inert placeholder**: no `type="submit"`, no wrapping `<form>`, no `name="add"`, no variant ID, no JS click handler anywhere in the script block. This must become a real Dawn `product-form` (with variant selection if the product has options) or at minimum a `quick-add` pattern.

### CSS
- `.shelf{display:grid;gap:14px;grid-template-columns:repeat(2,1fr)}` → `repeat(4,1fr)` at `≥860px` (405–406) — **2-up mobile, 4-up desktop**, no intermediate tablet step (a Dawn rebuild would typically want a 3-up tablet breakpoint too).
- `.card{padding:16px;display:flex;flex-direction:column;transition:.4s var(--ease)}`, `.card:hover{transform:translateY(-5px)}` (407–408) — lift-on-hover, no focus-visible equivalent (keyboard users get no hover-parity affordance beyond the global `:focus-visible` outline on the CTA button itself).
- `.card .shot{height:150px;border-radius:14px;background:linear-gradient(160deg,rgba(236,230,247,.12),rgba(75,58,143,.2))}` → `126px` at ≤760px (614), image inside capped `height:122px` (411) / `108px` mobile (615). **Fixed px heights for the image frame — fine as a "shot" placeholder frame, translate to `aspect-ratio` + Dawn's responsive image markup for real photos.**
- `.card .pill{position:absolute;top:9px;left:9px;border-radius:999px;background:rgba(23,16,43,.6)}` (412–413).
- `.card .rate{font-size:11.5px}` with `.rate b{color:var(--accent)}` (415–416) — the numeric rating is colored via the accent token, not a semantic "gold star" convention.
- `.card .pr{margin-top:auto}` (417) pushes price to the bottom of a flex column regardless of title/rate line-count — good, keeps buttons aligned across a row of varying-length titles.
- Card base chrome (radius, glass blur, shadow) all comes from the shared `.glass` utility (lines 125–136): `border-radius:var(--r)` (26px), `backdrop-filter:blur(24px) saturate(150%)`, `box-shadow:var(--g-shadow),var(--g-inset)`, plus a `::after` diagonal light-sheen gradient overlay.
- Breakpoints touching shop cards: **860px** (grid 2→4 cols), **760px** (shot height shrink).

### Animation / JS
- Only the shared `.rv`/`.rv-d1..d3` scroll-reveal stagger (first 4 cards use `rv`, `rv-d1`, `rv-d2`, `rv-d3`; the duplicate second set of 4 cards has **no stagger classes at all** — further evidence they were pasted in later without finishing the pattern). No carousel/slider JS in this section (unlike Combos) — it's a static CSS grid.

### Accessibility issues
- `<button class="btn btn-ghost btn-sm">Add to cart</button>` has no `type` attribute (defaults to `submit` inside a form, or plain button outside one — currently outside any `<form>`, so it does nothing and isn't announced as an action to assistive tech beyond its visible text).
- Star rating `★ 4.8` is presented as plain text glyphs with no `aria-label` (e.g. "Rated 4.8 out of 5") — a screen reader will read the literal star glyph or skip it depending on font/AT combination.
- `.pill` merchandising badges ("Best seller", "New") are meaningful but not marked up as such (no `<span class="visually-hidden">` context); acceptable as decorative but worth an accessible label pass.
- The duplicate 4 hand-drawn SVG cards embed `<text>` elements with product name fragments ("PURELANE", "TAP CLEANER", "500 ML") baked directly into the SVG — this text is **not selectable/translatable/screen-reader-friendly** and duplicates the `<h4>` right below it. Any real implementation must never repeat product copy as raster/vector text.

### Prototype-only issues
- **Duplicate cards** (see finding above) — must be deduplicated; pick one visual pattern (real photography) for production.
- Hardcoded ₹ prices, ratings, review counts, badges — all must move to Liquid/product-object bindings.
- "Add to cart" button is non-functional — no form, no AJAX cart call, no cart-drawer update logic anywhere in the script.
- Product "photos" are placeholder SVG (both the simple `.pimg` version and the illustrated bottle version) — neither is real photography; both are throwaway.
- Section is hardcoded to exactly 4 unique products — a real Shopify shop section needs to loop over `collection.products` (or a manually curated product-list block) with a configurable count/columns setting, and needs empty-state and "view all" handling that don't exist in the prototype.

### Reusability
The `.card` pattern (`.glass card` → `.shot` image frame w/ `.pill` badge → `<h4>` title → `.rate` → `.pr` price row → full-width `.btn`) is a clean, self-contained, highly reusable card and should become **one Liquid snippet** (`snippets/product-card.liquid`), parameterized by a `product` object — this exact visual skeleton is what most Shopify PDP grids look like, so it maps cleanly to Dawn's `card-product` conventions.

---

## 3. BEST-SELLING COMBOS — `section#combos` (lines 1181–1193)

### Structure
```html
<section class="sec" id="combos" data-scene="3">
  <div class="wrap">
    <div class="panel-head rv">...kicker "Pre-built to save you money" / h2 "Best selling combos" / rule / lede...</div>
    <div class="comborail rv">
      <article class="glass combo">                 <!-- combo 1: no .flag except "Most popular" on combo 1 & hero-combo on combo 3 -->
        <div class="tray">
          <span class="save">You save ₹398</span>
          <span class="flag">Most popular</span>
          <div class="stack">
            <span class="it"><span class="pimg p-kitchen" role="img" aria-label="..."></span><span>Cuts grease instantly</span></span>
            <span class="plus" aria-hidden="true">+</span>
            <span class="it">...</span>
            <span class="plus" aria-hidden="true">+</span>
            <span class="it">...</span>
          </div>
        </div>
        <div class="body">
          <h3>Kitchen essentials</h3>
          <div class="cnt">3 products</div>
          <p class="inc">Includes: Foaming Kitchen Cleaner, Dishwash Gel &amp; Tap Cleaner. ...</p>
          <div class="prow"><strong>₹499</strong><s>₹897</s><em>Save ₹398</em></div>
          <div class="fine">Inclusive of all taxes · COD available</div>
          <a class="btn btn-ghost" href="#bundles">Shop bundle <svg.../></a>
        </div>
      </article>
      <!-- 4 more .combo articles, one marked class="combo hero-combo" (highlighted "Best value") -->
    </div>
    <div class="swipecue" aria-hidden="true">...Swipe for more combos</div>
    <p class="railnote">Tapping "Shop bundle" opens the bundle picker...</p>
  </div>
</section>
```

### Content inventory (5 combo cards)
1. **Kitchen essentials** — 3 products (Foaming Kitchen Cleaner, Dishwash Gel, Tap Cleaner), ₹499 / ~~₹897~~, Save ₹398, flag "Most popular".
2. **Laundry care bundle** — 3 products (one item is a `.tile` icon placeholder for "Fabric Conditioner" rather than a real product image — i.e. even within the prototype, one combo item has no matching `--p-*` asset and falls back to a generic leaf-icon tile), ₹499 / ~~₹947~~, Save ₹448, no flag.
3. **Complete home bundle** — 5 products, ₹799 / ~~₹1,495~~, Save ₹696, flag "Best value", card has `class="combo hero-combo"` (visually emphasized) and primary (filled) CTA button instead of ghost.
4. **Bathroom deep clean** — 3 products, ₹499 / ~~₹897~~, Save ₹398, no flag.
5. **Hard water solution kit** — 2 products, ₹349 / ~~₹598~~, Save ₹249, no flag.

Every card has: `.save` pill ("You save ₹X" or "Biggest saving"), optional `.flag` pill (top-right), `.stack` of 2–3 mini product thumbnails each with a 1-line benefit caption, `<h3>` bundle name, `.cnt` product count, `.inc` "Includes: ..." paragraph (**hardcoded prose listing SKUs** — this is exactly the kind of content that should be generated from a real bundle/product-list, not hand-written per card), price row identical pattern to Shop, `.fine` legal microcopy, and a CTA linking to `#bundles` (in-page anchor, not a real cart/checkout action).

### CSS
- `.comborail{display:flex;gap:14px;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;margin:0 -18px;padding:4px 18px 14px;scrollbar-width:none}` + `::-webkit-scrollbar{display:none}` (511–513) — **native CSS scroll-snap carousel, no JS slider library**. `-webkit-overflow-scrolling:touch` for momentum on iOS.
- `.combo{flex:0 0 302px;scroll-snap-align:start}` → `flex:0 0 268px` at ≤760px (585).
- `.combo.hero-combo{border-color:rgba(240,160,60,.42);box-shadow:...,0 0 0 1px rgba(240,160,60,.2),var(--g-inset)}` (516) — emphasized card styling, echoed by `.tier.best` in Bundles (identical technique, different selector — another sign these two "featured card" treatments should share one modifier class/snippet, e.g. `.card--featured`).
- `.stack{display:flex;align-items:flex-end;gap:3px}`, each `.it{flex:1 1 0;min-width:0}` with a 66px-tall image and an 8.6px caption (524–529); `.stack .plus{padding-bottom:30px}` visually centers the "+" between bottle bases.
- `.combo .prow strong{font-size:25px}` / `.tier .qty{font-size:52px}` / `.card .pr strong{font-size:18px}` — three different price type-scales across three visually similar "price row" components (another consolidation opportunity).
- Mobile overrides at ≤760px (581–594): `.combo{flex:0 0 268px}`, `.stack .it .pimg{height:56px}`, `.stack .it .tile{height:56px;width:38px}`, `.comborail{margin:0 -14px;padding:4px 14px 12px}`.
- `.swipecue` (544–546): centered "Swipe for more combos" hint with an arrow icon, `aria-hidden="true"` — hint is **decorative and not perceivable by screen-reader users**, and nothing announces that the rail is horizontally scrollable to AT users at all.

### Animation / JS
- **No dedicated JS controller for this rail** — it's pure native scroll-snap (CSS-only), unlike the Hero stage and Proof rotator which have JS-driven autoplay. `.combo:hover{transform:translateY(-5px)}` is the only interactive affordance (486, mirrors `.card:hover`/`.tier:hover`). The only JS touching this section indirectly is the global `.rv` reveal observer (the whole rail fades/slides in as one `rv` unit — individual cards do **not** stagger-reveal independently, unlike Shop's cards which do get `.rv-d1/d2/d3`).

### Accessibility issues
- Horizontally-scrolling `.comborail` has no `tabindex`, no `aria-label` describing it as a scrollable region, and no keyboard-accessible next/prev controls — keyboard-only users must tab through the (mostly non-interactive) card contents and cannot easily scroll the rail itself without a mouse/trackpad/touch gesture.
- `.swipecue` "Swipe for more combos" is the **only** affordance suggesting scrollability, and it's `aria-hidden` — screen-reader users get zero indication additional combos exist beyond the DOM order (which is actually fine since it's `overflow-x:auto`, not `hidden`, so all 5 cards remain in the accessibility tree and tab order — but there's no visible focus indicator on the cards themselves since they contain no focusable element until the CTA link).
- `.flag`/`.save` pills convey meaning purely through position/color, no `aria-label` context (e.g. a screen reader hits "Most popular" as plain text, which is fine, but there's no landmark tying it to "this is the most popular of 5 combo options").
- Struck-through compare price (`<s>₹897</s>`) has no accompanying "regular price" `aria-label` — visually-impaired users relying on strikethrough-as-meaning will miss that this denotes a discount unless they infer it from the adjacent `<em>Save ₹398</em>`.

### Prototype-only issues
- The `.inc` "Includes: ..." sentence is **hand-written prose per combo** naming specific products — this doesn't scale and won't stay in sync with real inventory/pricing. In Shopify this is bundle-app territory (e.g. Shopify Bundles, PageFly Bundle, or a custom metafield listing component SKUs) — the section should render bundle contents from structured data, not freeform copy.
- One combo item (`Laundry care bundle`, item 2) uses a `.tile` fallback icon instead of a real product silhouette — evidence the placeholder-asset system wasn't fully built out; real photography removes this problem but the section markup should handle a "missing image" case gracefully regardless.
- CTAs all point at `#bundles` (anchor, not real add-to-cart) — button copy "Shop bundle" implies navigation to a bundle *builder*, which per `.railnote` copy ("opens the bundle picker with these products already added") is describing app/JS functionality that **does not exist in this file** — this is aspirational copy describing a feature that must be built (likely via a bundle app's product-picker modal), not something to port as-is.
- `railnote` and `swipecue` copy is static marketing/help text — fine to keep as merchant-editable section settings text, but currently hardcoded.

### Reusability
`.combo` is structurally analogous to `.card` (Shop) and `.tier` (Bundles): image/stack area → save/flag badges → title → description → price row → CTA. All three "commerce card" components (`.card`, `.combo`, `.tier`) share the same DNA (`.glass` base, price-row pattern, full-width bottom CTA, hover lift) but are implemented as three separate, non-shared class sets. **Strong candidate to unify into one parameterized card snippet** with slots for: image/stack slot, 0–2 badge slots, title, meta line, description, price block, CTA — differing mainly in image composition (single hero image vs multi-item stack vs product-silhouette row).

---

## 4. BUNDLES — `section#bundles` (lines 1196–1245)

### Structure
```html
<section class="sec" id="bundles" data-scene="3">
  <div class="wrap">
    <div class="glass sec-pad rv" style="margin-bottom:16px">
      <div class="panel-head" style="margin-bottom:0">
        <span class="kicker">Build your bundle</span>
        <h2 class="d2">One box. Every room.</h2>
        <p class="lede">Mix and match across kitchen, laundry, home and skin. ...</p>
      </div>
    </div>
    <div class="tiers">
      <article class="glass tier rv">
        <span class="tag">Starter</span>
        <div class="tierpix" aria-hidden="true"><span class="pimg p-combo2" role="img" aria-label="..."></span></div>
        <div class="qty">2<small>Products</small></div>
        <div class="price">₹349 <s>₹598</s></div>
        <p class="body-s">Flat ₹174 per product</p>
        <ul>
          <li><svg.../>Pick any two products</li>
          <li><svg.../>Free shipping across India</li>
        </ul>
        <a class="btn btn-ghost" href="#shop">Build this box</a>
      </article>
      <article class="glass tier best rv rv-d2">...Most popular, 3 products, ₹499/₹897...</article>
      <article class="glass tier rv rv-d3">...Whole home, 5 products, ₹799/₹1495...</article>
    </div>
  </div>
</section>
```

### Content inventory (3 tiers — note: distinct from the 5 "Combos" above; Bundles are generic quantity tiers, Combos are pre-curated named boxes)
| Tier | Tag | Qty | Price | Per-product | Perks (ul) | CTA style |
|---|---|---|---|---|---|---|
| 1 | Starter | 2 Products | ₹349 ~~₹598~~ | ₹174/product | Pick any two · Free shipping | ghost |
| 2 (`.tier.best`) | Most popular | 3 Products | ₹499 ~~₹897~~ | ₹166/product | Pick any three · Covers kitchen+laundry · Free shipping | primary (filled), arrow icon |
| 3 | Whole home | 5 Products | ₹799 ~~₹1495~~ | ₹160/product | Pick any five · Every room · Free shipping | ghost |

Each tier's `.tierpix` shows 1, 3, or 5 product silhouettes respectively (image count = tier quantity, a nice touch worth preserving conceptually). All copy ("Flat ₹X per product", bullet perks) is static prose computed by hand from the price — in production this per-unit price should be Liquid-computed (`price / qty`), not typed out.

### CSS
- `.tiers{display:grid;gap:14px;grid-template-columns:1fr}` → `repeat(3,1fr)` at `≥760px` (388–389).
- `.tier{padding:24px 22px;transition:.4s var(--ease)}`, `.tier:hover{transform:translateY(-5px)}` (390–391).
- `.tier.best{border-color:rgba(240,160,60,.44);box-shadow:0 26px 74px rgba(18,12,34,.44),0 0 0 1px rgba(240,160,60,.2),var(--g-inset)}` (392) — identical technique to `.combo.hero-combo`.
- `.tier .qty{font-family:'Outfit';font-weight:800;font-size:52px;line-height:.9}` → `44px` at ≤760px (617) — the large numeral is the visual anchor of the card.
- `.tier .price{font-family:'Outfit';font-weight:700;font-size:27px;color:var(--accent)}` (397).
- `.tier ul{list-style:none;display:grid;gap:8px}`, each `li` gets an inline checkmark SVG (`stroke-width:2.4`) colored `var(--accent)` (399–401) — **checklist uses `<ul><li>` semantically correctly**, just visually de-bulleted, which is fine for a11y (list semantics preserved, only `list-style` removed).
- `.tierpix{display:flex;align-items:flex-end;justify-content:center;gap:2px;height:78px}` → `70px` at ≤760px (590); `.tierpix.five .pimg{height:54px}` → `46px` mobile (592) — the 5-product tier shrinks each icon to fit the same row height as the 1/3-product tiers.
- Breakpoint touching this section: **760px** (grid 1→3 cols + numeral/icon size step-down).

### Animation / JS
- Only the shared `.rv`/`.rv-d2/d3` stagger reveal on section entry, plus the shared hover lift. **No autoplay, no carousel** — this is a static 1–3 column grid (collapses to a single column stack on mobile, no horizontal scroll unlike Combos).

### Accessibility issues
- `.tier.best` is visually distinguished only by border color/glow — no `aria-label` such as "Most popular, recommended" beyond the visible `.tag` text "Most popular" (which is fine as long as that text node is retained verbatim in any redesign).
- Checkmark SVGs inside `<li>` are decorative and correctly not the sole conveyor of meaning (text label follows each), but they have no `aria-hidden="true"` explicitly set (unlike most other decorative SVGs in the file, which mostly rely on their parent button/link already having a text label) — minor inconsistency, low risk.
- Price with struck-through compare price again lacks explicit accessible discount framing (`<s>` alone isn't announced as "was" by all screen readers without extra text/aria).
- Good: buttons are real `<a>` elements with visible text ("Build this box"), not icon-only, and inherit the global `:focus-visible` outline.

### Prototype-only issues
- "Build this box" CTA links to `#shop` (in-page anchor) — again describing a "bundle builder" interaction (pick N products) that has **no supporting JS/state anywhere in this file**. This entire tier system implies a real product-picker/bundle app (e.g. Shopify's native Bundles, or an app like Bundle Builder) — the static tiers here are marketing/pricing display only, not a functioning picker.
- Per-unit price ("Flat ₹174 per product") is hand-typed arithmetic — must be computed, not hardcoded, so it never drifts from the real price.
- `.tierpix` images are again base64 SVG placeholders (`--p-combo2`, `--p-kitchen`, etc.) — same asset-swap requirement as elsewhere.
- The distinction between "Bundles" (generic pick-N tiers) and "Combos" (named pre-set boxes) is a real merchandising concept worth preserving, but both currently point their CTAs at static anchors rather than a real add-to-cart/bundle-configurator flow — this is the single biggest functional gap between prototype and production for this part of the page.

### Reusability
`.tier` shares the same "commerce card" DNA as `.card`/`.combo` (see Combos section) — big numeral + price + bullet list + CTA is a distinct enough content shape (vs. image-led cards) that it likely warrants its own snippet (`snippets/pricing-tier.liquid`) rather than force-fitting into the same snippet as image-led product/combo cards, but should still share the underlying price-row sub-component.

---

## 5. REVIEWS RAIL — `section#reviews.revband` (lines 1000–1011)

### Structure
```html
<section class="sec revband" id="reviews" data-scene="1">
  <div class="wrap">
    <div class="revhead rv">
      <span class="kicker">That's what they said</span>
      <span class="agg"><span class="st">★★★★★</span> <b>4.8</b> from 8,000+ reviews</span>
      <span class="agg">Loved by <b>12 lakh+</b> homes</span>
    </div>
  </div>
  <div class="revrail rv" aria-label="Customer reviews">
    <div class="revtrack">
      <article class="glass-2 rcard">
        <div class="st">★★★★★</div>
        <h5>Works like a charm</h5>
        <p>Finally an eco option that cleans as well as the chemical detergent I used for years, and it smells better.</p>
        <div class="who"><svg.../><b>Anita</b><span>· Laundry detergent</span></div>
      </article>
      <!-- 6 unique review cards, then the SAME 6 repeated verbatim (12 total nodes) for the seamless marquee loop -->
    </div>
  </div>
</section>
```

### ⚠ Key finding: the review-rail content is duplicated **on purpose** (unlike the Shop duplication bug)
The `.revtrack` contains **10 `<article class="glass-2 rcard">` elements but only 5 unique reviews** — this is a deliberate, standard "infinite marquee" technique: the block of 5 is duplicated once, in the same order, so that when the CSS animation translates the track by exactly `-50%`, the loop is seamless (confirmed against `@keyframes marq` below). **Do not deduplicate this one** — but note that in a Liquid rebuild, the duplication must be done by the *template* (loop over reviews twice, or duplicate via JS `cloneNode`), not by hand-authoring 10 static blocks, since review content will come from a reviews app or metaobject list.

### Content inventory (5 unique reviews, each appearing twice in document order)
| Stars | Title | Body | Name | Product tag |
|---|---|---|---|---|
| ★★★★★ | Works like a charm | "Finally an eco option that cleans as well as the chemical detergent I used for years, and it smells better." | Anita | Laundry detergent |
| ★★★★★ | Best dishwash ever | "Our old dishwash left my help with dry, cracked skin. That stopped completely after we switched." | Priya | Dishwash gel |
| ★★★★★ | Great product, great packaging | "Very soft on hands with a lovely fragrance, and it feels good to be using far less plastic." | Sunita | Liquid handwash |
| ★★★★★ | Dog friendly | "We switched because chemical floor cleaners were setting off my dog's allergies. No reactions since." | Rohit S. | Floor cleaner |
| ★★★★★ | Sparkling taps again | "Hard water had ruined our bathroom fittings. Two sprays and the scale wipes straight off, no scrubbing." | Verified buyer | Tap cleaner |

Treat "5 unique testimonials" as the real content count when sourcing this from a reviews app.

- Header aggregate stats: `★★★★★ 4.8 from 8,000+ reviews` and `Loved by 12 lakh+ homes` — **both are hardcoded trust-signal numbers** that must come from a live reviews-app aggregate (e.g. Judge.me's `{{ shop.metafields.judgeme... }}`/widget snippet) rather than static text, or they will silently go stale.
- Each review card: 5-star glyph row (`★★★★★`, plain Unicode `&#9733;` characters — line 1009, not an icon font or SVG), review title `<h5>`, review body `<p>`, and a "who" line with a checkmark SVG (verified-purchase icon) + reviewer first name (or "Verified buyer" as a privacy-preserving fallback) + product purchased.

### CSS
- `.revband{padding:var(--sec-y) 0}` (471) — otherwise unstyled section wrapper, sits directly under Hero with no `.glass` panel background (unlike most other sections) — the review rail floats directly over the page's ambient scene background.
- `.revhead{display:flex;align-items:center;justify-content:center;gap:10px 18px;flex-wrap:wrap}` (472) centers the kicker + 2 aggregate stat chips.
- `.revrail{overflow:hidden;position:relative;mask-image:linear-gradient(90deg,transparent,#000 7%,#000 93%,transparent)}` (476–478) — **edge-fade mask** so cards fade in/out at the rail's left/right edges rather than hard-clipping; uses both `-webkit-mask-image` and standard `mask-image`.
- `.revtrack{display:flex;gap:12px;width:max-content;animation:marq 52s linear infinite}` (479) → duration shortens to `40s` at ≤760px (582, faster relative scroll speed on narrower/shorter tracks).
- `.revrail:hover .revtrack,.revrail:focus-within .revtrack{animation-play-state:paused}` (480) — **pauses the marquee on hover or keyboard focus**, a solid a11y/UX touch (keyboard users tabbing into a card will stop the motion).
- `@keyframes marq{from{transform:translate3d(0,0,0)}to{transform:translate3d(-50%,0,0)}}` (481) — translates exactly half the track width, which only produces a seamless loop because the content is exactly duplicated 1:1 (confirms the earlier finding — the -50% math depends on there being exactly 2x copies of the same total width).
- `.rcard{flex:0 0 auto;width:284px;padding:15px 17px;border-radius:18px}` → `width:250px;padding:13px 14px` at ≤760px (581).
- Card visuals use the **`.glass-2`** variant (not `.glass`) — a slightly different, less saturated blur/gradient treatment (lines 137–145) reserved for "secondary" glass surfaces (also used by hero badges and the product rotator frame) — worth preserving as a distinct "glass-2" token/mixin separate from primary `.glass` panels.
- Breakpoint touching this section: **760px** (card width/padding shrink + marquee speed-up).

### Animation / JS
- **Pure CSS animation** (`@keyframes marq`, linear infinite, 52s/40s) — **no JS driving the marquee at all**; JS only touches this section via the shared `.rv` reveal-on-scroll for the `revhead`/`revrail` wrapper elements (both get `.rv` but no stagger delay classes, so header and rail fade in together, not sequentially).
- Reduced-motion handling: the global `@media(prefers-reduced-motion:reduce)` rule (line 627–632) sets `*{animation-duration:.01ms !important;...}` — this **will freeze the marquee** for reduced-motion users (good), but note it also uses `!important`, so any per-component override is impossible to layer on top intentionally — if a future dev wants a *different* reduced-motion behavior for this specific rail (e.g. show a static grid instead of a frozen frame), they'd have to fight this global rule.

### Accessibility issues
- **This is the section with the most significant a11y gap in the required five.** The `.revrail` div has `aria-label="Customer reviews"` but is not a landmark element and has no `role="region"` — acceptable but minimal.
- The star ratings are rendered as literal Unicode star glyph repetition (`★★★★★`, i.e. `&#9733;` x5) with **no `aria-label`** anywhere ("5 out of 5 stars" is never announced) — a screen reader will read five consecutive "black star" glyphs, which is poor UX for AT users and should become an `aria-label="Rated 5 out of 5 stars"` on a wrapping element with the glyphs themselves `aria-hidden="true"`.
- The infinite CSS marquee, even though pause-on-hover/focus is implemented, **still auto-starts moving content immediately on page load** for users who have not indicated `prefers-reduced-motion` but may still be sensitive to motion (WCAG 2.2.2 "Pause, Stop, Hide" applies to any moving content lasting >5s that starts automatically) — there is no visible pause/play control independent of hover/focus, which is a borderline WCAG 2.2.2 failure for mouse-less, non-reduced-motion users who can't easily "focus" a non-interactive marquee track to pause it (focus-within requires a focusable descendant inside `.revtrack`, but the `.rcard` articles contain no focusable elements themselves, so **keyboard users likely cannot actually trigger the `:focus-within` pause at all** — this is a real, non-cosmetic bug worth flagging prominently).
- Reviewer identity "Verified buyer" (used as a fallback for one review) is a nice pattern to keep for privacy, but should be data-driven (e.g. reviews app decides when to show a real name vs. anonymized label), not hardcoded per review.

### Prototype-only issues
- Aggregate numbers (`4.8`, `8,000+ reviews`, `12 lakh+ homes`) and all 5 review bodies/names/products are **fully hardcoded marketing copy** — in production this entire section's content must come from a reviews platform (Judge.me, Loox, Yotpo, etc.) via their Liquid integration/App Block, not static HTML. This is the single clearest "fake data" section in the whole file.
- The manual 1:1 content duplication for the marquee loop is fine as a CSS technique but must be re-implemented via Liquid `{% for %}` (rendered twice) or JS `cloneNode`, never hand-duplicated blocks, once reviews are dynamic.
- No pagination/"view all reviews" link exists — real review sections typically link out to a full reviews page or open a modal; that's absent here entirely.

### Reusability
`.rcard` is a clean, simple, self-contained snippet candidate (`snippets/review-card.liquid`): star row + title + body + attribution line. It does **not** share structure with the commerce cards (`.card`/`.combo`/`.tier`) since it has no image, no price, no CTA — it should remain its own distinct component, but is trivially reusable if you ever want a second review-display section elsewhere on the site (e.g. a dedicated reviews page) using the same snippet with a static (non-marquee) grid wrapper instead of `.revrail`/`.revtrack`.

---

## Cross-cutting summary for the rebuild

### Shared card DNA across Shop/Combos/Bundles (candidate for one base snippet + modifiers)
All three use the same `.glass` panel base (26px radius, blur(24px) saturate(150%), dual box-shadow, diagonal light-sheen `::after`), the same hover lift (`translateY(-5px)` on a `.4s` cubic-bezier), and the same price-row anatomy (bold current price in Outfit, `<s>` struck compare price, small accent-colored discount pill) — but each re-implements it with different class names and slightly different type scales (18px/25px/52px for current price across the three). Reviews (`.rcard`) is intentionally a different, simpler component (no price/CTA/image).

### Data that must move from hardcoded HTML to Shopify objects (found across all 5 sections)
- All prices, compare-at prices, and "% off"/"Save ₹" computations (Hero price tags, Shop cards, Combos, Bundles).
- All product titles, images, and alt text (currently placeholder SVG silhouettes with descriptive `aria-label`s that *do* already read like real product names — good source material for real PDP titles/alt text).
- All star ratings and review counts on Shop cards, and the entire Reviews rail content + aggregate stats.
- Combo "Includes: ..." prose and bundle per-unit price math.
- Badge/pill merchandising labels ("Best seller", "New", "Top rated", "Most popular", "Best value") — should be tag- or metafield-driven, not per-card literals.

### Non-functional interactions that need real implementation (not just markup port)
- Add-to-cart buttons (Shop) — no form/AJAX anywhere.
- "Build this box" (Bundles) / "Shop bundle" (Combos) — copy implies a bundle-picker interaction that doesn't exist in this prototype's JS.
- Mobile burger menu — button exists, no drawer/panel.
- Email signup form — `onsubmit="return false"`, pure UI mockup, no real submission handler/Klaviyo-Shopify binding.

### Accessibility items to fix before/during the Liquid rebuild (prioritized)
1. Reviews marquee: keyboard users cannot reliably pause it (no focusable content inside `.rcard`) — likely WCAG 2.2.2 issue; add a visible pause control or make cards focusable.
2. Star ratings (both Shop cards and Reviews) rendered as bare glyphs with no accessible numeric label anywhere in the document.
3. Burger menu has no drawer, no `aria-expanded`.
4. Horizontally-scrolling combo rail has no keyboard-discoverable way to scroll besides tabbing to the (few) focusable CTA links inside it.
5. `<button>` elements without `type` attributes floating outside any `<form>` (Add to cart).

Everything else (reduced-motion handling, focus-visible outline, semantic list markup for tier perks, alt/aria-label coverage on decorative vs. meaningful SVGs) is handled better than average for a prototype.
