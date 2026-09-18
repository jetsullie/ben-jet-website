# Jet Sullivan × Ben Stapleton

Team filmmaking website for **benstapleton.jetsullivan.com**, built with Astro.

## Development

```sh
npm install
npm run dev -- --background
```

Manage the server with `npx astro dev status`, `npx astro dev logs`, and `npx astro dev stop`.

```sh
npm run build
npm run preview
```

Deploy the generated `dist/` directory. Hosting build command: `npm run build`; output directory: `dist`. Use Node 22.12 or newer. Domain/DNS setup is separate from this repository.

## Content

- `src/pages/index.astro`: homepage and services.
- `src/pages/contact.astro`: individual contact options. Ben currently routes explicitly through Jet; replace when his direct email is supplied.
- `src/components/GearCollection.astro`: the homepage’s expandable gear collection, organized from Audio through Lighting with nested item details.
- `public/data/gear.json`: editable inventory, initially copied from Jet’s public API on September 18, 2026. This is a snapshot, not a live sync. Images are hosted on jetsullivan.com. Add Ben’s confirmed items here (unique `id`, `name`, `category`, `rating` from 0.5–5, `description`, `kitParts` array, optional `imageUrl`/`imageAlt`, and `owner`). Update the collection intro when his inventory is added.
- `src/styles/site.css`: brand colors, shared typography, responsive styling, and reduced-motion support.

Brand references: the existing website’s brand center and gear page. No portraits, fabricated portfolio projects, or unconfirmed gear have been added.
