export type FocusIconName = "code" | "layout" | "team";

export interface FocusArea {
  title: string;
  description: string;
  icon: FocusIconName;
}

export type ProjectLogoName = "vorleser" | "progressa" | "ai-client" | "chatbot";

export type LinkIconName = "cv" | "linkedin" | "github" | "email" | "phone";

export interface FeaturedProject {
  title: string;
  role: string;
  summary: string;
  logo: ProjectLogoName;
  tags: string[];
  href: string;
  ctaLabel: string;
}

export interface HeroAction {
  label: string;
  detail?: string;
  href: string;
  icon: LinkIconName;
  emphasis: "primary" | "secondary";
}

export interface ProfileLink {
  label: string;
  detail: string;
  href: string;
  icon: LinkIconName;
}

export const portfolioContent = {
  name: "Simon Schnetzer",
  statusLine: "Frontend Developer at neke‑neke · Producing master's student",
  headline: "I build clear interfaces for AI-supported products, with an eye for product, coordination, and delivery.",
  highlightChips: ["Frontend & UI", "Product & team coordination", "Management-oriented direction"],
  primaryActions: [
    {
      label: "Email me",
      href: "mailto:simon@schnetzer.at",
      icon: "email",
      emphasis: "primary"
    },
    {
      label: "View CV",
      href: "/simon-schnetzer-cv.pdf",
      icon: "cv",
      emphasis: "secondary"
    }
  ] satisfies HeroAction[],
  focusAreas: [
    {
      title: "Frontend Implementation",
      icon: "code",
      description: "I work comfortably in React, Next.js, TypeScript, Tailwind CSS, HTML, CSS, and JavaScript, with a practical focus on clear, reliable interfaces, increasingly for AI-supported applications."
    },
    {
      title: "UI / Product Thinking",
      icon: "layout",
      description: "I'm especially interested in the connection between interface structure, usability, and the quality of a product experience."
    },
    {
      title: "Coordination & Responsibility",
      icon: "team",
      description: "I bring Scrum and product-ownership know-how plus spokesperson, mediation, project lead, and client-facing experience that supports alignment, clarity, and dependable delivery."
    }
  ] satisfies FocusArea[],
  projects: [
    {
      title: "Vorleser",
      logo: "vorleser",
      tags: ["Python", "Vanilla JS", "Speech AI", "CI/CD"],
      role: "Solo developer, own project",
      summary:
        "An open-source desktop app for macOS and Windows that turns any text into an audiobook, with natural voices, optional AI voice cloning, word-by-word follow-along, and its own CI/CD release pipeline. I built and published it on my own.",
      href: "https://simonschnezzer.github.io/vorleser-download/",
      ctaLabel: "Download page"
    },
    {
      title: "Progressa",
      logo: "progressa",
      tags: ["React", "Supabase", "Scrum", "Team of 5"],
      role: "Project lead / Scrum Master and Frontend Developer",
      summary:
        "A real-time Kanban app with an AI coach, planning poker, and gamification, built in a five-person interdisciplinary team at FH Salzburg. I led the project and worked on the frontend, and we used Progressa to manage our own development.",
      href: "https://app.progressa.team/",
      ctaLabel: "Open app"
    },
    {
      title: "AI client projects at neke-neke",
      logo: "ai-client",
      tags: ["React", "TypeScript", "Tailwind", "Python APIs"],
      role: "UX Design and Frontend Development",
      summary:
        "Interfaces for client systems, including an end-to-end practice management system with AI phone assistance in healthcare, interfaces for technical monitoring systems, and chat frontends for AI applications.",
      href: "#client-projects",
      ctaLabel: "Confidential"
    },
    {
      title: "Portfolio Chatbot",
      logo: "chatbot",
      tags: ["Next.js", "Fastify", "Cloudflare AI", "Docker"],
      role: "Prompt Engineer / Fullstack Developer",
      summary:
        "The chat on this page: a Next.js and Fastify app that answers from a curated knowledge base with guardrails, using Gemma 4 on Cloudflare Workers AI and a self-hosted model on my home server as fallback.",
      href: "#chatbot",
      ctaLabel: "You are using it"
    }
  ] satisfies FeaturedProject[],
  links: [
    {
      label: "LinkedIn",
      detail: "linkedin.com/in/simonschnetzerat",
      href: "https://www.linkedin.com/in/simonschnetzerat/",
      icon: "linkedin"
    },
    {
      label: "GitHub",
      detail: "github.com/SimonSchneZzer",
      href: "https://github.com/SimonSchneZzer",
      icon: "github"
    }
  ] satisfies ProfileLink[]
};
