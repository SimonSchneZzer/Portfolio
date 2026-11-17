import type { ProjectLogoName } from "@/content/portfolio";

export type LinkIconKind = "download" | "github" | "chat" | "app" | "school";

/** Long-form project pages (/projects/[slug]). Public facts only, taken from the knowledge base. */
export interface CaseStudy {
  slug: string;
  title: string;
  logo: ProjectLogoName;
  /** Used as <title> and for search results, so it names what the project is */
  seoTitle: string;
  description: string;
  role: string;
  period: string;
  tagline: string;
  image: { src: string; alt: string };
  links: { label: string; href: string; icon: LinkIconKind }[];
  intro: string[];
  sections: { heading: string; items: string[] }[];
  stack: string[];
  /** schema.org type for structured data */
  schemaType: "SoftwareApplication" | "WebApplication" | "CreativeWork";
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "vorleser",
    title: "Vorleser",
    logo: "vorleser",
    seoTitle: "Vorleser – open-source read-aloud app with AI voice cloning",
    description:
      "Vorleser is a free, open-source desktop app for macOS and Windows that turns any text into an audiobook, with natural voices, an offline voice and optional local AI voice cloning. Built by Simon Schnetzer.",
    role: "Solo developer – idea, design, development and release",
    period: "Since 11/2026 · version 3",
    tagline: "Turns any text into an audiobook – free, without an account.",
    image: { src: "/images/projects/vorleser.jpg", alt: "Download page of the Vorleser app with the app icon and download buttons for macOS and Windows" },
    links: [
      { label: "Download page", href: "https://simon.schnetzer.at/vorleser/", icon: "download" },
      { label: "Source code on GitHub", href: "https://github.com/SimonSchneZzer/vorleser", icon: "github" }
    ],
    intro: [
      "Vorleser reads EPUB, PDF, plain text, Markdown, HTML and pasted text aloud in natural German and English voices. It also works offline, and if you want, it reads with your own voice as a local AI model that runs on your computer.",
      "It is my strongest own project: I built and published it on my own, from the first idea to releases for macOS and Windows with its own updater."
    ],
    sections: [
      {
        heading: "What it does",
        items: [
          "Natural voices in German and English, plus an offline voice",
          "Optional voice cloning: your own voice as a local AI model that runs on CPU and GPU",
          "Word-by-word follow-along highlighting, chapter menu and saved reading position",
          "Dictation, reading selected text from any app, bookmarks",
          "Export as audiobook (M4B, MP3, WAV) with chapter markers",
          "Text recognition (OCR) for scanned PDFs using the platform’s native OCR"
        ]
      },
      {
        heading: "How it is built",
        items: [
          "Python backend and a web interface without a build step, together in a native desktop window (pywebview)",
          "Frontend in HTML, CSS and vanilla JavaScript with its own German/English localisation",
          "Backend on Python 3.12 with an HTTP server and JSON API built only on the standard library",
          "Speech AI: edge-tts and piper-tts for speech, chatterbox-tts for voice cloning, faster-whisper for dictation and word timestamps",
          "Distribution via PyInstaller as .dmg for macOS and an installer for Windows, with partial updates",
          "Tests with pytest including browser tests; CI/CD with GitHub Actions builds and releases on every git tag"
        ]
      }
    ],
    stack: ["Python", "Vanilla JavaScript", "pywebview", "Speech AI", "faster-whisper", "PyInstaller", "GitHub Actions", "pytest"],
    schemaType: "SoftwareApplication"
  },
  {
    slug: "progressa",
    title: "Progressa",
    logo: "progressa",
    seoTitle: "Progressa – real-time Kanban app with an AI coach",
    description:
      "Progressa is a real-time Kanban app with planning poker, an AI coach and gamification, built by a five-person team at FH Salzburg. Simon Schnetzer led the project as Scrum Master and worked on the frontend.",
    role: "Project lead / Scrum Master and frontend developer",
    period: "2026 · FH Salzburg · team of 5",
    tagline: "Real-time Kanban boards, planning poker, an AI coach and XP rewards.",
    image: { src: "/images/projects/progressa.jpg", alt: "Landing page of Progressa with the headline and a preview of the Kanban board" },
    links: [
      { label: "Open Progressa", href: "https://app.progressa.team/", icon: "app" },
      { label: "FH Salzburg project page", href: "https://portfolio.fh-salzburg.ac.at/projects/2026-progressa", icon: "school" }
    ],
    intro: [
      "Progressa is a project management app for small teams, built in an interdisciplinary team of MultiMediaTechnology and MultiMediaArt students at FH Salzburg.",
      "I led the project as Scrum Master – agile, but not strictly by the textbook – and worked on the frontend. We used Progressa itself to manage our own development."
    ],
    sections: [
      {
        heading: "What it does",
        items: [
          "Kanban boards with drag and drop and real-time updates",
          "Epics and stories, and planning poker for shared effort estimation",
          "An AI coach with situational awareness and a “suggested ticket” feature",
          "Gamification with XP and level-ups for completed tasks"
        ]
      },
      {
        heading: "My part",
        items: [
          "Leading a five-person team: planning, sprints, priorities and coordination between design and development",
          "Frontend development in React on top of Supabase",
          "Dogfooding: running the team’s own work in Progressa and feeding the findings back into the product"
        ]
      }
    ],
    stack: ["React", "Supabase", "Figma", "Scrum"],
    schemaType: "WebApplication"
  },
  {
    slug: "curriculum-compass",
    title: "Curriculum Compass",
    logo: "compass",
    seoTitle: "Curriculum Compass – the FH Salzburg curricula, tailored to your major",
    description:
      "Curriculum Compass by Simon Schnetzer: an unofficial overview of all 39 FH Salzburg degree programmes. Pick your major and electives and see what you take each semester, with ECTS, SWS and course content.",
    role: "Concept, data pipeline, design and development",
    period: "2026",
    tagline: "Every FH Salzburg curriculum, tailored to your major – in one calm overview.",
    image: { src: "/images/projects/compass.jpg", alt: "Curriculum Compass showing the MultiMediaArt master with the Producing specialisation, semester totals and courses" },
    links: [
      { label: "Open Curriculum Compass", href: "/compass/", icon: "app" },
      { label: "Source code on GitHub", href: "https://github.com/SimonSchneZzer/curriculum-compass", icon: "github" }
    ],
    intro: [
      "The official curriculum pages list every course of every major in one long table. Curriculum Compass turns them into a view of your own studies: choose your major or specialisation, pick your electives, and see what you take each semester.",
      "It covers 39 degree programmes in all six departments of FH Salzburg, in English and German, and works offline. It is unofficial; where it differs from the study regulations, the regulations apply."
    ],
    sections: [
      {
        heading: "What it does",
        items: [
          "Majors, specialisations and electives per programme, with ECTS and SWS totals and an estimate of the weekly workload",
          "Content and learning outcomes of every course in tooltips, so the page stays calm",
          "Search across all programmes and courses, also by short names such as MMA or CIS",
          "Choices are saved in the browser; a share link carries the picked electives",
          "Works offline as a progressive web app, interface in English and German"
        ]
      },
      {
        heading: "Data you can trust",
        items: [
          "A Python script reads the official curriculum pages and builds one JSON file per programme",
          "Special cases (bundled electives, choices that span several semesters) are checked against the programme brochures",
          "Errors on the source pages are shown with a note instead of being silently fixed",
          "A weekly check on my home server compares the data, the department pages and the brochures and notifies me about changes; nothing is published without review"
        ]
      }
    ],
    stack: ["HTML", "CSS", "JavaScript", "Python", "Service Worker", "Docker", "Caddy"],
    schemaType: "WebApplication"
  },
  {
    slug: "portfolio-chatbot",
    title: "Portfolio with AI chatbot",
    logo: "chatbot",
    seoTitle: "Portfolio with AI chatbot – Next.js, Fastify and Cloudflare Workers AI",
    description:
      "How Simon Schnetzer built his portfolio with an AI chat: Next.js and Fastify, a curated knowledge base with guardrails, Gemma 4 on Cloudflare Workers AI and a self-hosted fallback.",
    role: "Concept, prompt engineering and fullstack development",
    period: "2026",
    tagline: "A portfolio you can talk to – grounded in a curated knowledge base.",
    image: { src: "/images/projects/chatbot.jpg", alt: "The portfolio page of Simon Schnetzer with the chat panel answering a question" },
    links: [
      { label: "Try the chat", href: "/#chat", icon: "chat" },
      { label: "Source code on GitHub", href: "https://github.com/SimonSchneZzer/Portfolio", icon: "github" }
    ],
    intro: [
      "Instead of a static CV page, visitors can ask the portfolio questions and get answers in my voice – in English or German.",
      "The answers come only from a curated knowledge base about my work, with guardrails that keep the chat on professional topics and away from private or confidential details."
    ],
    sections: [
      {
        heading: "How it works",
        items: [
          "Next.js frontend with streamed answers that float in letter by letter",
          "Fastify backend that passes the whole knowledge base to the model with clear rules about tone and claims",
          "Gemma 4 on Cloudflare Workers AI; if it is unavailable, a self-hosted model on my home server answers instead",
          "Topic guardrails, a per-visitor rate limit and confidentiality rules for client work",
          "Deployed with Docker and Caddy on my home server"
        ]
      }
    ],
    stack: ["Next.js", "React", "TypeScript", "Fastify", "Cloudflare Workers AI", "Ollama", "Docker", "Caddy"],
    schemaType: "CreativeWork"
  }
];

export function getCaseStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}
