# Selected Projects

## Vorleser – open-source read-aloud app with voice cloning
**Role:** Solo developer (own project)  
since 11/2026, currently version 3  
Links: https://simon.schnetzer.at/vorleser/ (download page) and https://simon.schnetzer.at/projects/vorleser (case study)

Simon's strongest own project: he built and published it on his own, from idea to release.

- free desktop app for macOS (Apple Silicon) and Windows, no account needed
- "turns any text into an audiobook": reads EPUB, PDF, plain text, Markdown, HTML, and pasted text aloud
- natural voices in German and English, plus an offline voice
- optional voice cloning: your own voice as a local AI model that runs on CPU and GPU
- word-by-word follow-along highlighting, chapter menu, saved reading position, dictation
- reads selected text from any app aloud, bookmarks
- export as audiobook (M4B, MP3, WAV)
- text recognition (OCR) for scanned PDFs using the platform's native OCR
- own updater with partial updates
- free software under GPL-3.0-or-later

Architecture and tech:
- Python backend and a web interface without a build step, together in a native desktop window (pywebview)
- frontend in HTML, CSS, and vanilla JavaScript with its own German/English localisation
- backend: Python 3.12 with an HTTP server and JSON API built only on the standard library
- speech AI: edge-tts (online), piper-tts (offline), chatterbox-tts for voice cloning, faster-whisper for dictation and word timestamps
- audio export with ffmpeg including chapter markers
- distribution via PyInstaller as .dmg for macOS and an installer for Windows
- tooling: uv with locked dependencies, pytest including browser tests
- CI/CD with GitHub Actions: tests, builds for macOS and Windows, release on git tag

## Progressa – real-time Kanban app with an AI coach
**Role:** Project lead / Scrum Master and Frontend Developer  
FH Salzburg (MultiMediaTechnology × MultiMediaArt), 2026, team of 5  
Links: https://app.progressa.team/, https://simon.schnetzer.at/projects/progressa (case study) and https://portfolio.fh-salzburg.ac.at/projects/2026-progressa

- Kanban boards with drag and drop and real-time updates
- epics and stories, planning poker for shared effort estimation
- AI coach with situational awareness and a "suggested ticket" feature
- gamification: XP and level-ups for completed tasks
- Simon led the project agile, but not strictly by the textbook, and worked on the frontend
- dogfooding: the team used Progressa itself as the project management tool for its own development
- tech: React, Supabase, Figma
- shows that Simon can build a project management tool and lead the team building it

## Curriculum Compass – the FH Salzburg curricula, tailored to your major
**Role:** Solo developer (own project)  
since 11/2026  
Links: https://simon.schnetzer.at/compass/, https://simon.schnetzer.at/projects/curriculum-compass (case study) and https://github.com/SimonSchneZzer/curriculum-compass

An unofficial overview of the curricula of FH Salzburg that Simon built on his own, from the data to the interface.

- covers 39 degree programmes in all six departments of FH Salzburg
- students pick their major or specialisation and their electives and see what they take each semester, with ECTS and SWS totals and an estimate of the weekly workload
- course content and learning outcomes in tooltips, search across all programmes and courses (also by short names like MMA or CIS)
- choices are saved in the browser, share links carry the picked electives, works offline, interface in English and German
- data pipeline in Python: reads the official curriculum pages and writes one JSON file per programme; special cases are checked against the programme brochures, and errors on the source pages are shown with a note instead of being silently fixed
- a weekly check on Simon's home server compares the data, the department pages and the brochures and notifies him about changes; nothing is published without review
- tech: plain HTML, CSS and JavaScript without a build step, service worker for offline use, Python standard library for the data, self-hosted with Docker and Caddy
- privacy-friendly: no cookies, no account; visits are counted with a self-hosted, cookie-free counter
- shows product thinking (turning a long official table into a view for one student), careful work with data, and shipping and running a real service

## Surebet – arbitrage betting scanner on official odds APIs
**Role:** Solo developer (own project)  
since 11/2026  
Links: https://simon.schnetzer.at/surebet/ and https://simon.schnetzer.at/projects/surebet (case study); source code is private

A study project Simon built on his own: it finds "surebets" – cases where bookmakers' odds differ so much that betting on every outcome guarantees a small profit.

- a scanner on Simon's home server runs every 10 minutes and pulls odds from several official APIs (The Odds API, OddsPapi, the API-Sports family for football, basketball, hockey, handball, volleyball, baseball, rugby)
- matches the same game across sources with fuzzy team-name matching; it prefers not merging over merging wrongly, because a wrong match looks like a fake surebet
- checks 1X2, winner and over/under markets; a calculator splits the stake so every outcome pays the same, including exchange commission and rounding
- free API quotas are small, so each source has a token bucket that spreads requests evenly over the month or day
- one scan produces two views: the full view on his home network with push notifications (ntfy) for every new find, and a public page that shows only bookmakers with an Austrian or EU licence and no internal details
- before publishing, Simon asked the data providers in writing whether derived values may be shown publicly (both confirmed) and checked the licence status of about 390 bookmaker names; no links to bookmakers, no ads, no betting brokerage
- daily automated checks, push alerts for failing sources or crashed scans, a security review (escaping, response size limits, strict security headers)
- interface in English and German, light and dark mode following the system settings
- tech: Python standard library and SQLite for the scanner, plain HTML, CSS and JavaScript for the interface, nginx, Docker, Caddy, systemd timers
- shows working with messy real-world data, careful product and legal judgement, and running a service end to end
- it is a study project, not betting advice and not a commercial service

## LSD – Lazy Student Dashboard
**Role:** Frontend Developer and UX Designer  
FH Salzburg, 2025, team of 2  
Link: https://portfolio.fh-salzburg.ac.at/projects/2025-lsd-lazy-student-dashboard

- web app that helps students keep track of attendance and study progress
- imports the timetable from .ics calendar files
- progress display for teaching units and ECTS, with animated progress bars
- tracking of missed units per course, ECTS calculator, course configurator
- tech: Next.js, React, JavaScript

## Client projects at neke-neke
**Role:** UX Design and Frontend Development

Because of a confidentiality agreement, these are described without client names or internal details:
- end-to-end practice management system with AI phone assistance in healthcare
- interfaces for technical monitoring systems
- chat frontends for AI applications

## Seek Discomfort
**Role:** Fullstack Developer / Designer

- high-fidelity prototype
- included concept work, UI work, and fullstack implementation
- reflects Simon's ability to combine structure, design, and technical execution

## Portfolio Chatbot
**Role:** Prompt Engineer / Fullstack Developer  
Links: https://simon.schnetzer.at (try the chat) and https://simon.schnetzer.at/projects/portfolio-chatbot (case study)

This project is the chatbot on Simon's portfolio website, tailored to his own professional profile.

- Next.js frontend and Fastify backend
- the whole curated knowledge base is passed to the model, with guardrails that keep it focused on professionally relevant information
- answers come from Gemma 4 on Cloudflare Workers AI; if that is unavailable, it falls back to a self-hosted model via Ollama on Simon's home server
- deployed with Docker and Caddy on his home server
- reflects Simon's interest in product structure, interface quality, and practical AI-supported user experiences
