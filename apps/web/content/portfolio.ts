export type FocusIconName = "code" | "layout" | "team";

export interface FocusArea {
  title: string;
  description: string;
  icon: FocusIconName;
}

export type ProjectLogoName = "vorleser" | "progressa" | "compass" | "ai-client" | "chatbot";

export type LinkIconName = "cv" | "linkedin" | "github" | "email" | "phone";

export interface FeaturedProject {
  title: string;
  role: string;
  summary: string;
  logo: ProjectLogoName;
  /** Opened in a new tab when the title or logo is clicked; leave out for projects without a public page */
  href?: string;
  /** Slug of the project page under /projects (case study) */
  caseStudy?: string;
  ctaLabel: string;
}

export interface HeroAction {
  label: string;
  detail?: string;
  href: string;
  newTab?: boolean;
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
      newTab: true,
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
      caseStudy: "vorleser",
      logo: "vorleser",
      role: "Solo developer, own project",
      summary:
        "An open-source desktop app for macOS and Windows that turns any text into an audiobook, with natural voices and optional AI voice cloning. Built and published on my own.",
      href: "https://simonschnezzer.github.io/vorleser-download/",
      ctaLabel: "Download page"
    },
    {
      title: "Progressa",
      caseStudy: "progressa",
      logo: "progressa",
      role: "Project lead / Scrum Master and Frontend Developer",
      summary:
        "A real-time Kanban app with an AI coach, built by a five-person team at FH Salzburg. I led the project, worked on the frontend, and we managed our own work with it.",
      href: "https://app.progressa.team/",
      ctaLabel: "Open app"
    },
    {
      title: "Curriculum Compass",
      caseStudy: "curriculum-compass",
      logo: "compass",
      role: "Solo developer, own project",
      summary:
        "A tailored view of all 39 FH Salzburg curricula: pick your major and electives and see each semester at a glance. Works offline, data checked weekly.",
      href: "/compass/",
      ctaLabel: "Open app"
    },
    {
      title: "AI client projects at neke‑neke",
      logo: "ai-client",
      role: "UX Design and Frontend Development",
      summary:
        "Interfaces for client systems, from an AI-supported practice management system in healthcare to technical monitoring and chat frontends for AI.",
      ctaLabel: "Confidential"
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
