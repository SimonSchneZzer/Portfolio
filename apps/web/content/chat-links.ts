/**
 * Terms the chat links automatically (first mention per answer), whatever the model writes.
 * Projects and the CV point to pages on this site, technologies to their official sites.
 * Keep project entries in sync with case-studies.ts; add new technologies when they show up in the knowledge base.
 */
export const chatLinkTerms: { term: string; href: string }[] = [
  // Projects and CV (this site)
  { term: "Vorleser", href: "/projects/vorleser" },
  { term: "Progressa", href: "/projects/progressa" },
  { term: "Curriculum Compass", href: "/projects/curriculum-compass" },
  { term: "Surebet", href: "/projects/surebet" },
  { term: "CV", href: "/simon-schnetzer-cv.pdf" },
  { term: "Lebenslauf", href: "/simon-schnetzer-cv.pdf" },
  { term: "résumé", href: "/simon-schnetzer-cv.pdf" },
  // Technologies (official sites)
  { term: "Next.js", href: "https://nextjs.org" },
  { term: "React", href: "https://react.dev" },
  { term: "TypeScript", href: "https://www.typescriptlang.org" },
  { term: "JavaScript", href: "https://developer.mozilla.org/docs/Web/JavaScript" },
  { term: "Tailwind CSS", href: "https://tailwindcss.com" },
  { term: "Python", href: "https://www.python.org" },
  { term: "Supabase", href: "https://supabase.com" },
  { term: "Docker", href: "https://www.docker.com" },
  { term: "Fastify", href: "https://fastify.dev" },
  { term: "Caddy", href: "https://caddyserver.com" },
  { term: "nginx", href: "https://nginx.org" },
  { term: "SQLite", href: "https://sqlite.org" },
  { term: "Figma", href: "https://www.figma.com" },
  { term: "GitHub Actions", href: "https://github.com/features/actions" },
  { term: "Playwright", href: "https://playwright.dev" },
  { term: "pytest", href: "https://pytest.org" },
  { term: "Cloudflare Workers AI", href: "https://developers.cloudflare.com/workers-ai/" },
  { term: "Ollama", href: "https://ollama.com" },
  { term: "PyInstaller", href: "https://pyinstaller.org" },
  { term: "pywebview", href: "https://pywebview.flowrl.com" },
  { term: "Scrum", href: "https://www.scrum.org" }
];
