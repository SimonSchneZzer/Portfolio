# SEO-Checkliste

Stand: 15.11.2026 · Google Search Console: Property `https://simon.schnetzer.at` (bestätigt per Meta-Tag)

## Nach jeder inhaltlichen Änderung

- [ ] **Neue Seite** (z. B. neues Projekt unter `/projects/…`): In der Search Console oben bei „URL prüfen“ die neue URL eingeben → „Indexierung beantragen“. Pro Seite nur einmal.
- [ ] **Neues Projekt:** Eintrag in `apps/web/content/case-studies.ts` anlegen (Titel für Google, Beschreibung, Screenshot). Die Sitemap übernimmt es automatisch.
- [ ] **Geänderte Startseite** (Titel, Rolle, Arbeitgeber): `apps/web/content/site.ts` anpassen (Titel, Beschreibung, `jobTitle`, `employer`), damit Google und Link-Vorschauen stimmen.
- [ ] **Neuer CV:** mit `OneDrive/Business/CV/Generator/build_cv.py` erzeugen, die Web-Version per `scp` auf den Server kopieren (PDFs sind nicht im öffentlichen Repo).
- [ ] **Wissensbasis** (`knowledge/public`) gleich mitziehen, sonst erzählt der Chat etwas anderes als die Seite.

## Monatlich (ca. 10 Minuten)

- [ ] Search Console → **Leistung**: Für welche Suchbegriffe erscheint die Seite? Wie oft wird geklickt?
- [ ] Search Console → **Seiten**: Sind alle Seiten indexiert? Fehler?
- [ ] Suchen testen: „Simon Schnetzer Frontend Developer“, „Simon Schnetzer Salzburg“, „Vorleser App“.
- [ ] Läuft der Homeserver stabil? Ist die Seite offline, wenn Google vorbeischaut, verzögert das alles.

## Bei Gelegenheit

- [ ] Neue Profile oder Plattformen immer mit `https://simon.schnetzer.at` verlinken. Bisher eingetragen (Nov. 2026): LinkedIn, GitHub (inkl. Profil-README), FH-Portfolio, Vorleser-Downloadseite.
- [ ] Vorleser bei AlternativeTo, Product Hunt oder in „awesome“-Listen auf GitHub eintragen.
- [ ] neke-neke bzw. FH Salzburg um einen Link bitten (Team-Seite, News-Artikel).
- [ ] Einen Artikel schreiben, z. B. zur Bachelorarbeit (Lazy Loading in Next.js) oder „Wie ich Vorleser gebaut habe“.
- [ ] Deutsche Version der Seite (`/de` mit hreflang) für Suchen wie „Frontend Entwickler Salzburg“.

## Nicht entfernen

- Den Google-Bestätigungs-Tag in `apps/web/app/layout.tsx` (`verification.google`). Ohne ihn verliert die Search Console den Zugriff.
- Den `X-Robots-Tag: noindex` für PDFs in `apps/web/next.config.ts`.
