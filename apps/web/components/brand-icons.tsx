import type { FocusIconName, ProjectLogoName } from "@/content/portfolio";

/** Small line icons for the "What I bring" section. */
export function FocusIcon({ name }: { name: FocusIconName }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true
  };

  switch (name) {
    case "code":
      return (
        <svg {...common}>
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="13.5" y1="4" x2="10.5" y2="20" />
        </svg>
      );
    case "layout":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
      );
    case "team":
      return (
        <svg {...common}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
  }
}

/** Project logos. Vorleser and Progressa follow the real app icons; the other two are drawn for this page. */
export function ProjectLogo({ name }: { name: ProjectLogoName }) {
  switch (name) {
    case "vorleser":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="#252a31" />
          <g fill="#5fb7cc">
            <rect x="13.5" y="17" width="3.7" height="14" rx="1.6" />
            <rect x="20.2" y="11.2" width="3.7" height="25.6" rx="1.6" />
            <rect x="26.8" y="17" width="3.7" height="14" rx="1.6" />
            <rect x="33.5" y="20.4" width="3.7" height="7" rx="1.6" />
          </g>
        </svg>
      );
    case "progressa":
      return (
        <svg viewBox="-458 0 6690 6690" aria-hidden="true">
          <circle cx="2887" cy="3345" r="3345" fill="#ffffff" />
          <path
            d="M2273.11 2047.11V3994.44M2273.11 2047.11H3246.78C3418.93 2047.11 3584.04 2115.5 3705.77 2237.23C3827.5 2358.96 3895.89 2524.07 3895.89 2696.22C3895.89 2868.38 3827.5 3033.48 3705.77 3155.21C3584.04 3276.95 3418.93 3345.33 3246.78 3345.33H2273.11V2047.11ZM2273.11 3994.44C2100.96 3994.44 1935.85 4062.83 1814.12 4184.56C1692.39 4306.3 1624 4471.4 1624 4643.56M2273.11 3994.44H3571.33C3829.57 3994.44 4077.22 3857.67 4259.82 3614.2C4442.42 3370.74 4545 3040.53 4545 2696.22C4545 2351.91 4442.42 2021.7 4259.82 1778.24C4077.22 1534.78 3829.57 1398 3571.33 1398H1624V4643.56M1624 4643.56C1624 4815.71 1692.39 4980.81 1814.12 5102.55C1935.85 5224.28 2100.96 5292.67 2273.11 5292.67V4234.5"
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="292"
            strokeLinecap="square"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "ai-client":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <defs>
            <linearGradient id="logo-ai-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#3b3f6b" />
              <stop offset="1" stopColor="#1f2a44" />
            </linearGradient>
          </defs>
          <rect width="48" height="48" rx="12" fill="url(#logo-ai-bg)" />
          <path
            d="M21 12.5l2.2 6.3 6.3 2.2-6.3 2.2L21 29.5l-2.2-6.3-6.3-2.2 6.3-2.2z"
            fill="#c9cdfc"
          />
          <path d="M31.5 26l1.2 3.3 3.3 1.2-3.3 1.2-1.2 3.3-1.2-3.3-3.3-1.2 3.3-1.2z" fill="#8fd3e8" />
        </svg>
      );
    case "chatbot":
      return (
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <rect width="48" height="48" rx="12" fill="#2b3a33" />
          <path
            d="M14 17.5a4.5 4.5 0 0 1 4.5-4.5h11a4.5 4.5 0 0 1 4.5 4.5v7a4.5 4.5 0 0 1-4.5 4.5H22l-5.2 4.3c-.6.5-1.3 0-1.3-.6V29a4.5 4.5 0 0 1-1.5-3.4z"
            fill="#9be0b5"
          />
          <g fill="#2b3a33">
            <circle cx="19.5" cy="21" r="1.6" />
            <circle cx="24" cy="21" r="1.6" />
            <circle cx="28.5" cy="21" r="1.6" />
          </g>
        </svg>
      );
  }
}
