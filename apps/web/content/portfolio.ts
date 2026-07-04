export interface FocusArea {
  title: string;
  description: string;
}

export type LinkIconName = "cv" | "linkedin" | "github" | "email" | "phone";

export interface FeaturedProject {
  title: string;
  role: string;
  summary: string;
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
  eyebrow: "Developer moving toward product and team leadership",
  name: "Simon Schnetzer",
  statusLine: "Frontend Developer at neke-neke. BSc graduate, Producing master's student.",
  headline: "I build clear digital interfaces and connect frontend execution with product thinking, coordination, and delivery quality.",
  summary: [
    "I work best where frontend implementation, interface quality, and close collaboration with design, product, and management come together."
  ],
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
      description: "I work comfortably in React, Next.js, TypeScript, HTML, CSS, and JavaScript, with a practical focus on clear, reliable interfaces."
    },
    {
      title: "UI / Product Thinking",
      description: "I'm especially interested in the connection between interface structure, usability, and the quality of a product experience."
    },
    {
      title: "Coordination & Responsibility",
      description: "I bring spokesperson, mediation, project coordination, and team-facing experience that supports alignment, clarity, and dependable delivery."
    }
  ] satisfies FocusArea[],
  projects: [
    {
      title: "Drone Hub",
      role: "Frontend Developer / Designer",
      summary:
        "A product I worked on during my internship at neke-neke, combining frontend implementation, wireframing, interface decisions, and iterative refinement with the team.",
      href: "#drone-hub-placeholder",
      ctaLabel: "Project placeholder"
    },
    {
      title: "Progressa",
      role: "Project manager / Frontend Developer",
      summary:
        "A gamified project management tool from my completed bachelor project, combining product thinking, frontend implementation, interface design, coordination across design and development, and thesis work on lazy loading.",
      href: "#progressa-placeholder",
      ctaLabel: "Case study placeholder"
    },
    {
      title: "Seek Discomfort",
      role: "Fullstack Developer / Designer",
      summary:
        "A high-fidelity prototype where I combined concept work, UI design, structured product thinking, and fullstack implementation to shape the product experience.",
      href: "#seek-discomfort-placeholder",
      ctaLabel: "Project placeholder"
    },
    {
      title: "Chatbot",
      role: "Prompt Engineer / Fullstack Developer",
      summary:
        "A chatbot tailored to my professional profile, combining prompt engineering, fullstack development, retrieval logic, and a self-hosted model setup on my homeserver.",
      href: "#chatbot-placeholder",
      ctaLabel: "Project placeholder"
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
