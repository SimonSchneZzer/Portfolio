export interface FocusArea {
  title: string;
  description: string;
}

export interface FeaturedProject {
  title: string;
  role: string;
  summary: string;
  href: string;
  ctaLabel: string;
}

export interface PlaceholderLink {
  label: string;
  detail: string;
  href: string;
  icon: "cv" | "linkedin" | "github" | "email";
}

export const portfolioContent = {
  eyebrow: "About me",
  name: "Simon Schnetzer",
  headline: "I build frontend-focused digital products with a strong interest in interfaces, usability, and thoughtful product work.",
  summary: [
    "I'm a MultiMediaTechnology student at FH Salzburg with a background in Business Informatics / Industrial Engineering from HTL Hallein.",
    "I'm strongest where frontend implementation, interface quality, user-centered thinking, and structured collaboration meet."
  ],
  highlightChips: ["Frontend & UI", "Design-aware product thinking", "Structured collaboration"],
  focusAreas: [
    {
      title: "Frontend Implementation",
      description: "I work comfortably in React, Next.js, HTML, CSS, and JavaScript, with a practical focus on clear, reliable interfaces."
    },
    {
      title: "UI / Product Thinking",
      description: "I'm especially interested in the connection between interface structure, usability, and the quality of a product experience."
    },
    {
      title: "Communication & Responsibility",
      description: "I bring spokesperson, mediation, and team-facing experience that supports alignment, clarity, and dependable delivery."
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
        "A gamified project management tool from my bachelor project, combining product thinking, frontend implementation, interface design, and coordination across design and development.",
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
      label: "CV",
      detail: "Download my resume PDF",
      href: "/simon-schnetzer-cv.pdf",
      icon: "cv"
    },
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
    },
    {
      label: "Email me",
      detail: "simon@schnetzer.at",
      href: "mailto:simon@schnetzer.at",
      icon: "email"
    }
  ] satisfies PlaceholderLink[]
};
