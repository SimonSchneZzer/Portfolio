# Notes for AI assistants

Portfolio of Simon Schnetzer with an AI chat: https://simon.schnetzer.at. The owner writes in German; answer in German.

## Remind the owner about SEO

Whenever a change touches content (a new or changed project, a new page, a new role or employer, a new CV, a change to the knowledge base), finish by reminding the owner of the matching steps in `docs/SEO.md`, especially "Indexierung beantragen" for new URLs in Google Search Console. If the last monthly check in `docs/SEO.md` looks overdue, mention it once.

## Rules

- This repo is **public**. Never commit secrets, private contact details (address, phone, date of birth) or confidential client details. neke-neke client work is under NDA: describe it only at the level in `knowledge/public/13_claim_boundaries.md`.
- PSPO I is **in preparation, not earned**. Never claim the certification.
- Keep `knowledge/public`, `apps/web/content/*.ts` and the CV consistent. The owner's master CV (outside this repo, German; path in the
  owner's private `~/Projects/CLAUDE.md`) is the source of truth.
- **New project:** add it to the master CV (backup first), to `knowledge/public` (05 with app + case-study links, 11 incl. the
  "Links" list, 03 for new skills) and to the site (card, case study, logo, light + dark image `name.jpg`/`name-dark.jpg`,
  sitemap, `content/chat-links.ts` for auto-links in the chat). See `~/Projects/CLAUDE.md`.
- Do not remove the Google verification tag in `apps/web/app/layout.tsx`.

## Deploy (home server)

`ssh homeserver`, then `cd ~/Portfolio && git pull && cd ops/docker && docker compose -f docker-compose.homeserver.yml up -d --build`. Secrets live only in `ops/docker/homeserver.env` on the server. PDFs are gitignored; the CV is copied to `~/Portfolio/apps/web/public/simon-schnetzer-cv.pdf` with `scp`.

## Same domain, other things (home server)

- `/legal` is the imprint and privacy notice. It must match what the site does: keep it up to date when you add
  external services, storage or tracking. It also covers `/compass` (Curriculum Compass), `/vorleser` (Vorleser download page + app counter) and `/surebet` (odds study project, private repo), separate repos and containers.
- `/c/*` is the GoatCounter visit counter (`~/goatcounter`), `/compass/*` is Curriculum Compass (`~/compass`), `/vorleser/*` the Vorleser download page (`~/vorleser`). All are
  routed by the shared Caddy in `~/ai-server/Caddyfile`, not by `ops/docker/Caddyfile`.
