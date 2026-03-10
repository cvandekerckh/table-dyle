# CLAUDE.md

## Project

Static restaurant website.

Goals: - present the restaurant and its concept - display the menu -
allow customers to reserve a table - show contact and location
information

The website must be **entirely in French**.

The restaurant concept to communicate: - **brasserie belge** -
**produits frais** - friendly atmosphere - presence of a **terrasse
(patio)** that should be clearly highlighted.

Reservations are handled via **Table Agent** (free, iframe embed — tableagent.com).

The site must remain **simple, static, fast, and inexpensive to host**.

Inspire yourself from the following restaurant : https://www.girlandthegoat.com/los-angeles

Please track the project on github

------------------------------------------------------------------------

## Tech Stack

-   Astro
-   HTML
-   CSS
-   minimal JavaScript only when necessary

Hosting: - Vercel

Domain: - `.be`

The Astro project must build to **static HTML**.

------------------------------------------------------------------------

## Required Pages

### Accueil (Home)

Must contain: - hero section - restaurant concept description (brasserie
belge, produits frais, ambiance conviviale) - mention and highlight of
the **terrasse** - photos of the restaurant - restaurant logo -
reservation call-to-action - opening hours (if available)

------------------------------------------------------------------------

### Menu

The menu page must allow displaying the **menu as a PDF**.

Include: - a visible button or embedded viewer to access the PDF - clear
call-to-action to view/download the menu

------------------------------------------------------------------------

### Réservation

This page must integrate the **Table Agent reservation system** (free iframe embed).

Include: - Table Agent iframe widget - clear call-to-action **"Réserver une table"**
- practical info cards (hours, phone, email fallback)

Example:

```html
<iframe
  src="https://tableagent.com/iframe/YOUR_SLUG/"
  width="100%"
  height="600"
  frameborder="0"
  title="Réserver une table — La Table de la Dyle"
></iframe>
```

------------------------------------------------------------------------

### Contact

Must contain: - address - phone number - email - Google Maps embed -
link to reservations

------------------------------------------------------------------------

## Photos Section

Pictures are available in a photos directory. Contains photos of the
restaurant - interior and exterior - the **terrasse** - the restaurant
**logo**

Images should be visually prominent and optimized for web.

------------------------------------------------------------------------

## Design Rules

Visual identity must follow the restaurant colors: - **white** - **light
grey** - **black**

Design should be: - clean - elegant - minimal - modern - mobile-friendly

Priorities: - strong reservation call-to-action - large food /
restaurant imagery - clear typography - simple layout

The **terrasse** should be visually highlighted as a key feature.

------------------------------------------------------------------------

## Performance Constraints

The site must remain lightweight.

Avoid: - large JS frameworks - unnecessary dependencies - heavy
client-side logic

Prefer static rendering.

Images should be optimized.

------------------------------------------------------------------------

## SEO Basics

Content should be in **French** and include: - restaurant name -
city/location - keywords such as **brasserie belge**, **terrasse**,
**produits frais**

Each page should include: - descriptive `<title>` - meta description

------------------------------------------------------------------------

## Development Rules

When modifying the project: - keep architecture simple - prefer static
solutions - minimize JavaScript - avoid adding backend services - avoid
unnecessary dependencies

----------------

## Screenshot Workflow
- Use Puppeteer to improve your design using screenshots. 
- Screenshots can be saved automatically to `./temporary screenshots/screenshot-N.png` (auto-incremented, never overwritten).
- After screenshotting, read the PNG from `temporary screenshots/` with the Read tool — Claude can see and analyze the image directly.
- When comparing, be specific: "heading is 32px but reference shows ~24px", "card gap is 16px but should be 24px"
- Check: spacing/padding, font size/weight/line-height, colors (exact hex), alignment, border-radius, shadows, image sizing

## Output Defaults
- Single `index.html` file, all styles inline, unless user says otherwise
- Mobile-first responsive

## Anti-Generic Guardrails
- **Colors:** Never use default Tailwind palette (indigo-500, blue-600, etc.). Pick a custom brand color and derive from it.
- **Shadows:** Never use flat `shadow-md`. Use layered, color-tinted shadows with low opacity.
- **Typography:** Never use the same font for headings and body. Pair a display/serif with a clean sans. Apply tight tracking (`-0.03em`) on large headings, generous line-height (`1.7`) on body.
- **Gradients:** Layer multiple radial gradients. Add grain/texture via SVG noise filter for depth.
- **Animations:** Only animate `transform` and `opacity`. Never `transition-all`. Use spring-style easing.
- **Interactive states:** Every clickable element needs hover, focus-visible, and active states. No exceptions.
- **Images:** Add a gradient overlay (`bg-gradient-to-t from-black/60`) and a color treatment layer with `mix-blend-multiply`.
- **Spacing:** Use intentional, consistent spacing tokens — not random Tailwind steps.
- **Depth:** Surfaces should have a layering system (base → elevated → floating), not all sit at the same z-plane.

## Hard Rules
- Do not add sections, features, or content not in the reference
- Do not "improve" a reference design — match it
- Do not stop after one screenshot pass
- Do not use `transition-all`
- Do not use default Tailwind blue/indigo as primary color
