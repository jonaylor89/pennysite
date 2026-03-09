# Pennysite Design System

A complete token reference for building consistent UI across Pennysite.

---

## Philosophy

The Pennysite design language is built on three ideas:

- **Warmth over sterility.** This product is for humans building things they care about. Every color, typeface, and spacing decision should feel crafted, not generated.
- **Power through restraint.** Two accent colors. One serif. One sans. Do more with less.
- **Hierarchy earns trust.** Clear visual hierarchy—especially in type—tells users where to look and what matters. Never bold everything.

---

## Fonts

### Typefaces

| Role | Family | Fallback |
|---|---|---|
| Display / Headlines | `Instrument Serif` | `Georgia, serif` |
| Body / UI | `Inter` | `system-ui, sans-serif` |
| Monospace / Prompts | `Fira Code` | `'Courier New', monospace` |

### Import (Google Fonts) 

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
```

OR

use `next-fonts`

### CSS Variables

```css
--font-display: 'Instrument Serif', Georgia, serif;
--font-body:    'Inter', system-ui, sans-serif;
--font-mono:    'Fira Code', 'Courier New', monospace;
```

### Type Scale

```css
--text-xs:   12px;
--text-sm:   14px;
--text-base: 16px;
--text-lg:   18px;
--text-xl:   22px;
--text-2xl:  28px;
--text-3xl:  36px;
--text-4xl:  48px;
--text-5xl:  64px;
```

### Line Heights

```css
--leading-tight:  1.15;   /* Display headlines */
--leading-snug:   1.35;   /* Section headings */
--leading-normal: 1.6;    /* Body copy */
--leading-loose:  1.8;    /* Long-form / editorial */
```

### Letter Spacing

```css
--tracking-tight:  -0.03em;  /* Large display text */
--tracking-snug:   -0.02em;  /* Headings */
--tracking-normal:  0em;     /* Body */
--tracking-wide:    0.05em;  /* Buttons */
--tracking-wider:   0.12em;  /* Uppercase labels */
```

### Font Weights

```css
--weight-regular:  400;
--weight-medium:   500;
--weight-semibold: 600;
--weight-bold:     700;
```

### Typographic Roles

| Role | Font | Weight | Size Token | Extra |
|---|---|---|---|---|
| Hero / Page Title | `--font-display` | 400 | `clamp(42px, 7vw, 80px)` | `--tracking-tight`, `--leading-tight` |
| Section Heading (H2) | `--font-display` | 400 | `--text-3xl` to `--text-4xl` | `--tracking-snug`, `--leading-snug` |
| Card Heading (H3) | `--font-display` | 400 | `--text-xl` | `--tracking-snug` |
| Lead Body | `--font-body` | 400 | `--text-lg` | `--leading-normal` |
| Body | `--font-body` | 400 | `--text-base` | `--leading-normal` |
| UI Label / Button | `--font-body` | 600 | `--text-sm` | `--tracking-wide` |
| Section Eyebrow | `--font-body` | 600 | `--text-xs` | `--tracking-wider`, uppercase |
| Prompt Input | `--font-mono` | 400 | `--text-base` | — |
| Code / Token Ref | `--font-mono` | 400 | `--text-xs` | — |

---

## Color

### Palette Overview

The palette is organized into four groups: **Canvas** (backgrounds), **Ink** (text), **Accent Green** (primary brand), and **Accent Gold** (premium / upgrade moments).

### Canvas & Surface

```css
--color-canvas:        #FAFAF7;   /* Page background — warm off-white */
--color-surface:       #F4F3EE;   /* Cards, section backgrounds */
--color-surface-2:     #ECEAE3;   /* Inset areas, input backgrounds */
--color-border:        #DDD9CE;   /* Dividers, default strokes */
--color-border-strong: #C5C0B4;   /* Focused / hover borders */
```

> **Why warm whites?** Pure `#FFFFFF` feels clinical. The warm undertone in the canvas palette aligns with the product's human, crafted personality and pairs naturally with the serif headline font.

### Ink (Text)

```css
--color-ink-900: #1A1916;   /* Primary text — almost-black with warm undertone */
--color-ink-600: #5C5A54;   /* Secondary text, body copy, descriptions */
--color-ink-400: #9A9790;   /* Placeholder text, muted labels */
--color-ink-200: #D4D1C9;   /* Disabled states */
```

> All ink values use a warm undertone (slight yellow-brown cast) so they feel cohesive against the canvas rather than cold and grafted-on.

### Brand Accent — Forest Green

Used for: primary CTAs, active states, links, focus rings, checkmarks, success indicators.

```css
--color-accent:       #2D6A4F;   /* Primary — buttons, links, active */
--color-accent-hover: #245740;   /* Hover / pressed state */
--color-accent-light: #EAF4EF;   /* Tinted backgrounds — badges, highlights */
--color-accent-text:  #1B4332;   /* Text on --color-accent-light */
```

> **Why forest green?** It signals growth and action (go, build, launch) without the startup-y neon quality. It's editorial and considered — which builds trust with non-technical founders putting their brand in Pennysite's hands.

### Secondary Accent — Warm Gold

Used for: Pro/upgrade CTAs, premium badges, pricing highlights. Use sparingly — gold only appears where value is being communicated.

```css
--color-gold:       #C9A84C;   /* Gold — upgrade, Pro, premium moments */
--color-gold-light: #FBF5E6;   /* Tinted background for gold badges */
```

### Feedback Colors

```css
--color-success: #2D6A4F;   /* Same as accent — consistent green = good */
--color-warning: #C9A84C;   /* Same as gold — warm, not alarming */
--color-error:   #C0392B;   /* Red — reserved for destructive/error states only */
--color-info:    #2C5F8A;   /* Blue — neutral informational */
```

### Color Usage Rules

- **Never use `--color-error` for decoration.** Red is reserved for error states only.
- **`--color-gold` is for value signals only.** Don't use it for general highlights or decoration — it loses meaning.
- **Background stacking order:** `--color-canvas` → `--color-surface` → `--color-surface-2` → `white`. Each step is slightly warmer/darker. Don't skip levels.
- **Text on colored backgrounds:** On `--color-accent`, use `white`. On `--color-accent-light`, use `--color-accent-text`. On `--color-gold`, use `white`. On `--color-gold-light`, use `#8B6914`.

---

## Spacing

All spacing uses a **4px base grid**.

```css
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-5:   20px;
--space-6:   24px;
--space-8:   32px;
--space-10:  40px;
--space-12:  48px;
--space-16:  64px;
--space-20:  80px;
--space-24:  96px;
--space-32: 128px;
```

### Spacing Guidelines

| Context | Token |
|---|---|
| Inline gap (icon + text) | `--space-2` |
| Button padding (vertical) | `--space-3` |
| Button padding (horizontal) | `--space-5` to `--space-6` |
| Card internal padding | `--space-8` |
| Section gap between elements | `--space-6` to `--space-8` |
| Section vertical padding | `--space-20` |
| Page max-width gutters | `--space-8` |

---

## Border Radius

```css
--radius-sm:   4px;     /* Small inputs, tight UI elements */
--radius-md:   8px;     /* Default inputs, dropdowns */
--radius-lg:   12px;    /* Icon containers, small cards */
--radius-xl:   20px;    /* Prompt input field */
--radius-2xl:  28px;    /* Feature cards, pricing cards */
--radius-full: 9999px;  /* Pills — buttons, badges, tags */
```

> **Rule of thumb:** Buttons and badges use `--radius-full` (pill). Cards use `--radius-2xl`. Inputs use `--radius-xl`. Icon containers use `--radius-lg`.

---

## Shadows

```css
--shadow-xs:     0 1px 2px rgba(26,25,22,0.06);
--shadow-sm:     0 2px 6px rgba(26,25,22,0.08);
--shadow-md:     0 4px 16px rgba(26,25,22,0.10);
--shadow-lg:     0 8px 32px rgba(26,25,22,0.12);
--shadow-xl:     0 16px 56px rgba(26,25,22,0.14);
--shadow-accent: 0 4px 20px rgba(45,106,79,0.25);  /* Green glow for primary CTAs */
```

> Shadows use the same warm ink value (`#1A1916` = `rgba(26,25,22,...)`) so they feel cohesive against warm backgrounds rather than cold blue-black.

### Shadow Usage

| Context | Token |
|---|---|
| Input field (default) | `--shadow-md` |
| Card (default) | none |
| Card (hover) | `--shadow-lg` |
| Modal | `--shadow-xl` |
| Primary CTA button | `--shadow-accent` |
| Primary CTA button (hover) | `0 6px 28px rgba(45,106,79,0.35)` |

---

## Motion

```css
--ease-out:      cubic-bezier(0.16, 1, 0.3, 1);    /* Most transitions */
--ease-in-out:   cubic-bezier(0.45, 0, 0.55, 1);   /* Modals, overlays */
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1); /* Button press, bouncy micro-interactions */

--duration-fast: 120ms;   /* Hover color changes */
--duration-base: 220ms;   /* Standard transitions */
--duration-slow: 380ms;   /* Page-level animations, entrances */
```

### Animation Guidelines

- **Entrances** use `fadeUp`: `opacity: 0; transform: translateY(20px)` → `opacity: 1; transform: translateY(0)` with `--ease-out` and `--duration-slow`.
- **Stagger** entrance animations by `100ms` per element for a cascade effect.
- **Hover lifts** on cards: `transform: translateY(-3px)` with `--duration-base`.
- **Button press**: `transform: scale(0.98)` with `--duration-fast` and `--ease-spring`.
- **Never animate layout properties** (`width`, `height`, `top`, `left`). Only `transform` and `opacity`.

---

## Z-Index

```css
--z-below:   -1;    /* Background decorations (blobs, patterns) */
--z-base:     0;    /* Default document flow */
--z-raised:  10;    /* Dropdowns, floating elements */
--z-overlay: 100;   /* Overlays, drawers */
--z-modal:   200;   /* Modals, dialogs */
--z-toast:   300;   /* Toast notifications — always on top */
```

---

## Components

### Buttons

#### Primary (Forest Green)

```css
font-family:    var(--font-body);
font-size:      var(--text-sm);
font-weight:    var(--weight-semibold);
padding:        var(--space-3) var(--space-6);
background:     var(--color-accent);
color:          white;
border:         none;
border-radius:  var(--radius-full);
box-shadow:     var(--shadow-accent);
letter-spacing: -0.01em;
transition:     all var(--duration-base) var(--ease-out);

/* Hover */
background:  var(--color-accent-hover);
transform:   translateY(-1px);
box-shadow:  0 6px 28px rgba(45,106,79,0.35);

/* Active */
transform: scale(0.98);
```

#### Secondary (Outlined)

```css
font-family:    var(--font-body);
font-size:      var(--text-sm);
font-weight:    var(--weight-semibold);
padding:        var(--space-3) var(--space-6);
background:     white;
color:          var(--color-ink-900);
border:         1.5px solid var(--color-border-strong);
border-radius:  var(--radius-full);
transition:     all var(--duration-base) var(--ease-out);

/* Hover */
border-color: var(--color-ink-900);
transform:    translateY(-1px);
box-shadow:   var(--shadow-sm);
```

#### Ghost (Text)

```css
font-family:     var(--font-body);
font-size:       var(--text-sm);
font-weight:     var(--weight-medium);
background:      transparent;
color:           var(--color-ink-600);
border:          none;
text-decoration: underline;
text-underline-offset: 3px;
transition:      color var(--duration-base) var(--ease-out);

/* Hover */
color: var(--color-ink-900);
```

#### Gold (Pro / Upgrade)

```css
background:   var(--color-gold);
color:        white;
border:       none;
border-radius: var(--radius-full);
/* Same sizing as Primary */

/* Hover */
background: #b8943c;
transform:  translateY(-1px);
```

#### Nav Button

```css
font-size:     var(--text-sm);
font-weight:   var(--weight-semibold);
padding:       var(--space-2) var(--space-5);
border:        1.5px solid var(--color-ink-900);
border-radius: var(--radius-full);
background:    transparent;
color:         var(--color-ink-900);

/* Hover */
background: var(--color-ink-900);
color:      var(--color-canvas);
```

---

### Badges

#### Green (Free, Success, Active)

```css
font-size:     var(--text-xs);
font-weight:   var(--weight-semibold);
padding:       3px var(--space-3);
border-radius: var(--radius-full);
background:    var(--color-accent-light);
color:         var(--color-accent-text);
border:        1px solid rgba(45,106,79,0.2);
```

#### Gold (Pro, Upgrade, Premium)

```css
background: var(--color-gold-light);
color:      #8B6914;
border:     1px solid rgba(201,168,76,0.3);
```

#### Neutral (Beta, Info, Tags)

```css
background: var(--color-surface-2);
color:      var(--color-ink-600);
border:     1px solid var(--color-border);
```

---

### Input / Prompt Field

```css
font-family:   var(--font-mono);
font-size:     var(--text-base);
color:         var(--color-ink-900);
background:    white;
border:        1.5px solid var(--color-border-strong);
border-radius: var(--radius-xl);
padding:       var(--space-4) var(--space-6);
box-shadow:    var(--shadow-md);
caret-color:   var(--color-accent);
transition:    border-color var(--duration-base) var(--ease-out),
               box-shadow var(--duration-base) var(--ease-out);

/* Focus */
border-color: var(--color-accent);
box-shadow:   var(--shadow-md), 0 0 0 3px rgba(45,106,79,0.12);

/* Placeholder */
color:       var(--color-ink-400);
font-family: var(--font-mono);
```

---

### Cards

```css
background:    var(--color-surface);
border:        1px solid var(--color-border);
border-radius: var(--radius-2xl);
padding:       var(--space-8);
transition:    transform var(--duration-base) var(--ease-out),
               box-shadow var(--duration-base) var(--ease-out),
               border-color var(--duration-base) var(--ease-out);

/* Hover */
transform:    translateY(-3px);
box-shadow:   var(--shadow-lg);
border-color: var(--color-border-strong);
```

#### Featured / Highlighted Card

```css
background:    var(--color-ink-900);
border-color:  var(--color-accent);
color:         white;
transform:     scale(1.03);
box-shadow:    var(--shadow-xl);
```

---

### Navigation

```css
/* Nav bar */
position:       fixed;
background:     rgba(250,250,247,0.85);
backdrop-filter: blur(12px);
border-bottom:  1px solid var(--color-border);
padding:        var(--space-4) var(--space-8);

/* Nav links */
font-size:   var(--text-sm);
font-weight: var(--weight-medium);
color:       var(--color-ink-600);
transition:  color var(--duration-base) var(--ease-out);

/* Nav links: hover */
color: var(--color-ink-900);
```

---

### Section Eyebrow Label

The small uppercase label that appears above section headings.

```css
font-size:      var(--text-xs);
font-weight:    var(--weight-semibold);
letter-spacing: var(--tracking-wider);
text-transform: uppercase;
color:          var(--color-ink-400);
margin-bottom:  var(--space-4);
```

---

### Chip / Tag (Prompt Suggestions)

```css
font-size:     var(--text-sm);
color:         var(--color-ink-600);
background:    white;
border:        1px solid var(--color-border);
border-radius: var(--radius-full);
padding:       var(--space-2) var(--space-4);
cursor:        pointer;
transition:    all var(--duration-base) var(--ease-out);

/* Hover */
border-color: var(--color-accent);
color:        var(--color-accent-text);
background:   var(--color-accent-light);
transform:    translateY(-1px);
box-shadow:   var(--shadow-sm);
```

---

## Layout

### Max Widths

```css
--max-w-content: 1120px;  /* Standard page content */
--max-w-text:     760px;  /* Hero headlines, reading columns */
--max-w-narrow:   560px;  /* Section titles, subheadings */
--max-w-form:     580px;  /* Input fields, forms */
```

### Page Structure

```
[Nav — fixed, full-width]
[Hero — 100vh, centered, padding-top: space-32]
[Feature Section — max-w-content, padding: space-20 space-8]
[Alternate Section — full-width bg, surface color]
[Pricing Section — max-w-content]
[Footer — max-w-content, border-top]
```

### Grid Patterns

```css
/* 3-column feature / pricing grid */
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: var(--space-6);

/* 2-column documentation / side-by-side */
display: grid;
grid-template-columns: 1fr 1fr;
gap: var(--space-8);

/* Responsive collapse */
@media (max-width: 768px) {
  grid-template-columns: 1fr;
}
```

---

## Decorative Elements

### Background Blobs

Soft radial gradients used in the hero to add depth without distraction.

```css
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: var(--z-below);
}

/* Green blob — left */
width: 500px; height: 500px;
background: radial-gradient(circle, rgba(45,106,79,0.08) 0%, transparent 70%);

/* Gold blob — right */
width: 400px; height: 400px;
background: radial-gradient(circle, rgba(201,168,76,0.10) 0%, transparent 70%);
```

### Noise Texture Overlay

A subtle grain texture over the page for depth and tactility.

```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* SVG feTurbulence noise */
  pointer-events: none;
  opacity: 0.4;
  z-index: var(--z-overlay);
}
```

---

## Full CSS Variable Reference

Copy this block into your `:root` to use the full system:

```css
:root {
  /* Canvas & Surface */
  --color-canvas:        #FAFAF7;
  --color-surface:       #F4F3EE;
  --color-surface-2:     #ECEAE3;
  --color-border:        #DDD9CE;
  --color-border-strong: #C5C0B4;

  /* Ink */
  --color-ink-900: #1A1916;
  --color-ink-600: #5C5A54;
  --color-ink-400: #9A9790;
  --color-ink-200: #D4D1C9;

  /* Accent — Forest Green */
  --color-accent:       #2D6A4F;
  --color-accent-hover: #245740;
  --color-accent-light: #EAF4EF;
  --color-accent-text:  #1B4332;

  /* Accent — Warm Gold */
  --color-gold:       #C9A84C;
  --color-gold-light: #FBF5E6;

  /* Feedback */
  --color-success: #2D6A4F;
  --color-warning: #C9A84C;
  --color-error:   #C0392B;
  --color-info:    #2C5F8A;

  /* Typography */
  --font-display: 'Instrument Serif', Georgia, serif;
  --font-body:    'Inter', system-ui, sans-serif;
  --font-mono:    'Fira Code', 'Courier New', monospace;

  /* Type Scale */
  --text-xs:   12px;
  --text-sm:   14px;
  --text-base: 16px;
  --text-lg:   18px;
  --text-xl:   22px;
  --text-2xl:  28px;
  --text-3xl:  36px;
  --text-4xl:  48px;
  --text-5xl:  64px;

  /* Line Heights */
  --leading-tight:  1.15;
  --leading-snug:   1.35;
  --leading-normal: 1.6;
  --leading-loose:  1.8;

  /* Letter Spacing */
  --tracking-tight:  -0.03em;
  --tracking-snug:   -0.02em;
  --tracking-normal:  0em;
  --tracking-wide:    0.05em;
  --tracking-wider:   0.12em;

  /* Font Weights */
  --weight-regular:  400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;

  /* Spacing (4px grid) */
  --space-1:   4px;
  --space-2:   8px;
  --space-3:   12px;
  --space-4:   16px;
  --space-5:   20px;
  --space-6:   24px;
  --space-8:   32px;
  --space-10:  40px;
  --space-12:  48px;
  --space-16:  64px;
  --space-20:  80px;
  --space-24:  96px;
  --space-32: 128px;

  /* Border Radius */
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   20px;
  --radius-2xl:  28px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-xs:     0 1px 2px rgba(26,25,22,0.06);
  --shadow-sm:     0 2px 6px rgba(26,25,22,0.08);
  --shadow-md:     0 4px 16px rgba(26,25,22,0.10);
  --shadow-lg:     0 8px 32px rgba(26,25,22,0.12);
  --shadow-xl:     0 16px 56px rgba(26,25,22,0.14);
  --shadow-accent: 0 4px 20px rgba(45,106,79,0.25);

  /* Motion */
  --ease-out:      cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out:   cubic-bezier(0.45, 0, 0.55, 1);
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);
  --duration-fast: 120ms;
  --duration-base: 220ms;
  --duration-slow: 380ms;

  /* Z-Index */
  --z-below:   -1;
  --z-base:     0;
  --z-raised:  10;
  --z-overlay: 100;
  --z-modal:   200;
  --z-toast:   300;
}
```
