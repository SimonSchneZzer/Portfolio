# SEO-Checkliste

Stand: 18.11.2026 · Google Search Console: Property `https://simon.schnetzer.at` (bestätigt per Meta-Tag)

**Bing & Co. automatisch (seit 18.11.2026):** Nach jedem erfolgreichen Deploy einer öffentlichen Seite meldet der Server die
geänderten Seiten per **IndexNow** an Bing (und Yandex, Seznam, Naver) – `homeserver-dashboard/server/indexnow.py`, Schlüssel-
datei `apps/web/public/<key>.txt` (öffentlich, so gewollt; nicht löschen). Google macht bei IndexNow nicht mit.

## Einmalig offen (Stand 18.11.2026)

- [ ] Search Console → „URL prüfen“ → **Indexierung beantragen** für `https://simon.schnetzer.at/` (neue Projekte),
      `https://simon.schnetzer.at/surebet/` und `https://simon.schnetzer.at/projects/surebet`.
- [ ] Bing Webmaster Tools → **URL-Übermittlung** für dieselben Adressen (danach übernimmt IndexNow).

- [ ] Search Console → „URL prüfen“ → **Indexierung beantragen** für `https://simon.schnetzer.at/compass/` und
      `https://simon.schnetzer.at/vorleser/` (beide seit 17.11. auf dieser Domain, vorher GitHub Pages).
- [ ] Search Console → **Sitemaps** → `sitemap.xml` neu einreichen (enthält jetzt auch /compass/ und /vorleser/).
- [ ] **Bing Webmaster Tools** anlegen und die Property aus der Search Console importieren (2 Minuten). Bing speist
      auch DuckDuckGo, Ecosia und die Websuche von ChatGPT/Copilot.
- [ ] Alte github.io-Adressen sind umgeleitet; die GitHub-Repos verlinken seit 17.11. auf die neuen Adressen.

## Nach jeder inhaltlichen Änderung

- [ ] **Neue Seite** (z. B. neues Projekt unter `/projects/…`): In der Search Console oben bei „URL prüfen“ die neue URL eingeben → „Indexierung beantragen“. Pro Seite nur einmal.
- [ ] **Neues Projekt:** Eintrag in `apps/web/content/case-studies.ts` anlegen (Titel für Google ≤ 44 Zeichen – " | Simon Schnetzer"
      kommt dazu –, Beschreibung ≤ 160 Zeichen, Bild hell + dunkel, `updated`). Die Sitemap übernimmt es automatisch.
- [ ] **Seite inhaltlich geändert:** `updated` (Fallstudie) bzw. `site.updated` (Startseite) auf das heutige Datum setzen –
      das ist das „lastmod“ in der Sitemap.
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
- [ ] Curriculum Compass dort verlinken, wo FH-Salzburg-Studierende suchen: ÖH Salzburg / Studienvertretungen,
      Erstsemestrigen-Gruppen, Reddit. Ein Link von einer FH- oder ÖH-Seite wäre der stärkste mögliche.
- [ ] neke-neke bzw. FH Salzburg um einen Link bitten (Team-Seite, News-Artikel).
- [ ] Einen Artikel schreiben, z. B. zur Bachelorarbeit (Lazy Loading in Next.js) oder „Wie ich Vorleser gebaut habe“.
- [ ] Deutsche Version der Seite (`/de` mit hreflang) für Suchen wie „Frontend Entwickler Salzburg“.

## Nicht entfernen

- Den Google-Bestätigungs-Tag in `apps/web/app/layout.tsx` (`verification.google`). Ohne ihn verliert die Search Console den Zugriff.
- Den `X-Robots-Tag: noindex` für PDFs in `apps/web/next.config.ts`.
