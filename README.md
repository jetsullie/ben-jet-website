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

## Previous work publishing

`/previous-work/` contains Remember, Connect, and Capture. Links to `#remember`, `#connect`, and `#capture` open the matching collection. Publish through the **Previous Work** editor at `/admin/`: choose a section, title, description, optional event date, optional HTTPS link, and optional attachment (up to 100 MB). Edit, replace/remove attachments, and delete posts in the same editor. Projects appear newest event date first; undated posts follow, ordered by publication time. On the homepage, click or tap the footer name three times within 1.2 seconds to open `/admin/`. The shortcut still uses the existing owner sign-in protection.

The editor reuses the Jet Sullivan site's media-entry API, validation, attachment storage, and ranged media delivery. Its categories are restricted to this site's three collections, with separate `team-work:` KV keys. The existing `/admin/*` owner middleware protects writes. Cloudflare Pages needs the existing `CONTENT_KV`, `MEDIA_BUCKET`, and owner-access bindings configured; Astro's local dev server serves the design but does not execute Pages Functions. No projects are fabricated or published by this change.

## Admin identities

The server-side allowlist permits only `jetsullivan1@gmail.com` and `benstapleton06@gmail.com`, after verification of the Cloudflare Access token. This email is used for Ben's private admin identity; it is not added to the public contact page.

Deployment setup still needs a Cloudflare Access policy allowing these same two exact identities for `/admin` and `/admin/*`, MFA enforcement, and valid `CF_ACCESS_DOMAIN` and `CF_ACCESS_AUD` bindings. Verify protection on every deployed hostname and preview before enabling publishing. Updating this repository does not change the Cloudflare dashboard policy. Missing authentication configuration continues to deny access.

## Location and contact panels

The admin **Location & Contact** section edits the shared location plus each person's public display name, introduction, email, phone, website, button label, and panel color. It includes live previews and automatically selects contrasting text. Saving persists one validated settings document at `team-site:settings` in `CONTENT_KV`. Public pages read `/api/settings`; authenticated editing uses `/admin/api/settings`. Public contact edits do not modify the admin identity allowlist. Empty email/phone/website fields are hidden; at least one contact method is required. The main contact button prefers email, then website, then phone. Defaults remain available if the public settings request fails.
