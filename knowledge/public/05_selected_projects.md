# Selected Projects

## Vorleser – open-source read-aloud app with voice cloning
**Role:** Solo developer (own project)  
since 11/2026, currently version 3  
Link: https://simonschnezzer.github.io/vorleser-download/

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
Links: https://app.progressa.team/ and https://portfolio.fh-salzburg.ac.at/projects/2026-progressa

- Kanban boards with drag and drop and real-time updates
- epics and stories, planning poker for shared effort estimation
- AI coach with situational awareness and a "suggested ticket" feature
- gamification: XP and level-ups for completed tasks
- Simon led the project agile, but not strictly by the textbook, and worked on the frontend
- dogfooding: the team used Progressa itself as the project management tool for its own development
- tech: React, Supabase, Figma
- shows that Simon can build a project management tool and lead the team building it

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

This project is the chatbot on Simon's portfolio website, tailored to his own professional profile.

- Next.js frontend and Fastify backend
- the whole curated knowledge base is passed to the model, with guardrails that keep it focused on professionally relevant information
- answers come from Gemma 4 on Cloudflare Workers AI; if that is unavailable, it falls back to a self-hosted model via Ollama on Simon's home server
- deployed with Docker and Caddy on his home server
- reflects Simon's interest in product structure, interface quality, and practical AI-supported user experiences
