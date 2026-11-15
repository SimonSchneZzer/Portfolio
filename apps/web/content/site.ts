/** Public facts for search engines and link previews. Keep in sync with the knowledge base; nothing private here. */
export const site = {
  url: "https://simon.schnetzer.at",
  name: "Simon Schnetzer",
  title: "Simon Schnetzer – Frontend Developer in Salzburg",
  description:
    "Simon Schnetzer is a frontend developer in Salzburg, Austria, building clear interfaces for AI-supported products with React, Next.js, and TypeScript at neke-neke. Portfolio with projects like Vorleser and Progressa, plus a chat to ask about his work.",
  jobTitle: "Frontend Developer",
  employer: { name: "neke-neke GmbH", url: "https://neke-neke.com" },
  locality: "Salzburg",
  country: "AT",
  sameAs: [
    "https://www.linkedin.com/in/simonschnetzerat/",
    "https://github.com/SimonSchneZzer",
    "https://portfolio.fh-salzburg.ac.at/users/simon-schnetzer"
  ],
  knowsAbout: [
    "Frontend development",
    "React",
    "Next.js",
    "TypeScript",
    "Tailwind CSS",
    "UI/UX design",
    "AI-supported applications",
    "Scrum"
  ]
} as const;
