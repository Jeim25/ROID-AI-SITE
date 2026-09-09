# ROID-AI-SITE — De-AI-slop Redesign & Refactor Spec

## Context

`ROID-AI-SITE` (repo: `Jeim25/ROID-AI-SITE`, live: `jeim25.github.io/ROID-AI-SITE`) is the
thesis demo site for ROID-AI, a 2D anime frame-interpolation model. The current site was
vibecoded and, while the purple color palette should be kept, it currently reads as generic
AI-generated output. This document is both an audit (what's wrong and why) and a spec
(exactly what to build instead). Implement it faithfully — do not reintroduce any of the
patterns listed under "Do not reintroduce."

**Design direction chosen by the site owner (non-negotiable defaults for this pass):**
1. **Personality:** Minimal, premium tool feel. No anime-decorative motifs (no film-strip
   borders, no cel/sketch textures, no character illustration). Personality comes from
   restraint + **one deliberate signature detail**, not from ornamentation.
2. **Typography:** A full three-role type pairing — a display font, a body font, and a
   monospace font for technical/spec values.
3. **CSS architecture:** Migrate off Bootstrap entirely onto Tailwind CSS utility classes.

---

## Part 1 — Audit: what's wrong and why

### 1. Inconsistent type/color system
- `styles.css` defines **22 distinct `font-size` values** (0.6rem through 2rem) with no
  underlying scale — sizes were picked ad hoc per component.
- Only 5 `font-weight` values (300/500/600/700/800) are used inconsistently — visually
  equivalent elements (e.g. small uppercase labels) sometimes get 600, sometimes 700.
- `--display-font` and `--body-font` both resolve to Nunito — no typographic contrast
  between headline and body text.
- 23 raw hex colors are defined in `:root`, including redundant duplicates (`#fff` and
  `#FFFFFF`).

### 2. AI design-language tells (pill overuse)
- `border-radius: 100px` (full pill shape) is applied to **7 unrelated components**:
  `.hero-badge`, `.loading-bar`, the eyebrow-adjacent badge, `.status-pill`, `.gallery-badge`,
  `.comparison-badge`, and one inline style. Pill-everything is one of the most recognizable
  "AI-generated landing page" signatures.

### 3. Unprofessional spacing/margins
- Section vertical padding is copy-pasted as `5rem 0` (or `5rem 0 3rem`) across every
  section regardless of that section's actual content weight.
- **15 inline `style="..."` attributes** exist directly in `index.html` alongside a full
  765-line stylesheet — spacing/color rules are set in two competing places.
- The "How it works" steps are numbered `1`, `2.1`, `2.2`, `3` — an ad hoc decimal
  sub-numbering scheme invented for one step and abandoned everywhere else.

### 4. Excessive eyebrow text
- The identical `.section-eyebrow` kicker pattern is reused above **four** sections
  ("Process", "Examples", "Before You Upload", "Help"), plus the hero has its own separate
  pill-eyebrow ("ROI-Guided Deformable Convolutions"). Five kicker labels on one page.

### 5. No personality for an anime production tool
- The site is styled as a generic purple SaaS template (Bootstrap defaults + one rounded
  sans-serif) with no visual connection to animation production, despite the product being
  about genga/douga (keyframe/in-between) workflows.

### 6. Unmaintainable code
- Bootstrap 5.3.3 (full CSS + JS bundle) is loaded and then fought against with ~118 custom
  classes and 15 inline styles — two competing styling systems.
- 118 unique classes across only 172 CSS rules, with near-duplicate recipes
  (`.gallery-badge`, `.comparison-badge`, `.status-pill`) that should share one base
  component + modifiers instead of being redefined each time.

### Do not reintroduce
- Pill-shaped (`border-radius: 100px`/`9999px`) badges as a default decoration.
- Section eyebrows as a default pattern above every section.
- Inline `style="..."` attributes in HTML.
- Ad hoc one-off font-size or color values outside the defined scale/tokens below.
- Bootstrap classes or the Bootstrap CDN link/script.
- Anime-decorative motifs (film strips, cel textures, sketch borders, mascots/characters).

---

## Part 2 — Target design system

### 2.1 Typography (three-role pairing)

Load via Google Fonts (or self-host if the coding tool prefers), and expose all three
through the Tailwind theme so every text element must be assigned one deliberately:

| Role | Font | Usage |
|---|---|---|
| Display | **Space Grotesk** | H1/H2/H3, hero headline, section titles — anything meant to carry visual weight |
| Body | **Inter** | Paragraphs, nav, buttons, form labels, FAQ copy |
| Mono (technical) | **JetBrains Mono** | Resolution/format specs ("1920×1080", "JPG"), frame numbers, percentages, timers, metric values in the evaluation dashboard |

The mono treatment for technical/spec values **is the signature detail** for personality
(fix #5): it's the one deliberate flourish that ties to the production/technical nature of
the tool without resorting to anime-decorative ornament. Apply it consistently (e.g. a
`.font-mono` / `font-mono` utility with slightly tighter tracking) anywhere a spec, number,
or file constraint is shown — file specs, resolution badges, percentages, metric tables in
`evaluation.html`. Do not apply mono font to prose or headings.

Define a real type scale (replace the 22 ad hoc sizes) — e.g. via Tailwind's default scale
plus one or two custom entries if needed:

```
text-xs   0.75rem   — micro labels, timestamps
text-sm   0.875rem  — secondary text, nav links, captions
text-base 1rem      — body copy
text-lg   1.125rem  — subtitle/lede
text-xl   1.25rem   — card titles
text-2xl  1.5rem    — subsection headings
text-3xl  1.875rem  — section headings
text-4xl  2.5rem    — hero headline (mobile)
text-5xl  3.5rem    — hero headline (desktop)
```

Font weights: standardize on exactly 3 — `400` (body), `600` (emphasis/labels), `700`
(headings). Drop 300, 500, and 800 entirely.

### 2.2 Color tokens

Carry over the existing purple palette (it's liked) but define it as Tailwind theme colors
instead of loose CSS variables, and prune duplicates (`#fff` vs `#FFFFFF` → one value):

```
purple-50, purple-100, purple-200, purple-400, purple-600, purple-800, purple-900
lavender-bg, card-bg, border-color
text-primary, text-secondary, text-muted
success (was #3DAD6A/#1A6B3A/#F0FBF5/#B8E8CB family)
danger  (was #D95454/#8B2323/#FFF4F4/#F5C2C2 family)
```

Each family (success/danger) should collapse its 3–4 near-duplicate shades into a documented
3-step scale (bg/border/text) used consistently by `evaluation.html`'s winner/loser badges
and anywhere else status color appears.

### 2.3 Spacing

Replace copy-pasted `5rem 0` section padding with a deliberate 2–3 step rhythm based on
section importance, using Tailwind spacing tokens (e.g. `py-16` for standard sections,
`py-24` for the hero, `py-12` for dense/list-heavy sections like FAQ) — not one blanket
value everywhere.

### 2.4 Personality direction: "minimal premium tool"

- Strip decorative pill badges down to functional use only (e.g. a status indicator that
  truly is a state, not a label wrapped for decoration).
- Remove the repeated eyebrow-kicker pattern; where a section genuinely needs a label,
  use it once, not as a template applied to every section.
- The one signature detail is the mono-font technical treatment (2.1) — do not add a second
  "signature" element on top of it. Restraint is the point.

---

## Part 3 — Refactor plan (Bootstrap → Tailwind)

1. Remove the Bootstrap CDN `<link>` and `<script>` tags from `index.html` and
   `evaluation.html`.
2. Set up Tailwind (CLI or CDN Play build is fine for a static GitHub Pages site — prefer
   the CLI build with a `tailwind.config.js` so the custom theme tokens from Part 2 are
   real config, not inline arbitrary values).
3. Register the type scale, font families, color tokens, and spacing rhythm from Part 2 in
   `tailwind.config.js` under `theme.extend`.
4. Rebuild each component currently defined as a custom class (`.hero-badge`, `.nav-link`,
   `.btn-nav`, `.gallery-badge`, `.comparison-badge`, `.status-pill`, `.scope-card`, etc.)
   as Tailwind utility combinations, or — where a pattern repeats 3+ times identically —
   extract it via `@apply` into a single reusable class instead of hand-rolling utilities
   every time it's used. Badge/pill-style components should share one base treatment with
   modifiers, not be redefined per section.
5. Eliminate all 15 inline `style="..."` attributes in `index.html` — replace with Tailwind
   classes.
6. Delete `styles.css` once everything is migrated (or keep a minimal file only for the
   handful of things Tailwind genuinely can't express, e.g. the `@keyframes pulse`
   animation — keep custom animations here, styled with theme colors, not hardcoded hex).
7. Fix the process-step numbering in the "How it works" section to a single consistent
   scheme (plain `1, 2, 3, 4` — fold "Optical Flow" and "ROI Detection" into two distinct
   steps rather than `2.1`/`2.2` sub-numbering).
8. Apply the same system to `evaluation.html` for consistency (it currently duplicates
   the comparison-badge pattern).

## Acceptance checklist

- [ ] No Bootstrap link/script remains in any HTML file.
- [ ] No inline `style="..."` attributes remain.
- [ ] All font sizes trace back to the defined scale in `tailwind.config.js` — no ad hoc
      arbitrary values (`text-[13px]` etc.) outside that scale.
- [ ] Exactly 3 font weights in use (400/600/700).
- [ ] Space Grotesk used for display, Inter for body, JetBrains Mono used only for
      technical/spec values.
- [ ] No component uses a full pill (`rounded-full`) purely for decoration — only where a
      status/state genuinely calls for it.
- [ ] No more than one eyebrow-style kicker label appears per page, and only where it
      earns its place.
- [ ] Process steps numbered consistently (1, 2, 3, 4).
- [ ] Section vertical spacing follows the 2–3 step rhythm, not one repeated value.
- [ ] `evaluation.html` uses the same token system as `index.html` (no drift between pages).
