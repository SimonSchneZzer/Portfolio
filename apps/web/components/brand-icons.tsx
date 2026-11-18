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

/** Project logos. Vorleser, Progressa and Curriculum Compass follow the real app icons; the others are drawn for this page. */
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
    case "compass":
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <rect width="64" height="64" rx="16" fill="#5b3fd6" />
          <path d="M45 21.1A17 17 0 1 0 45 42.9" fill="none" stroke="#ffffff" strokeWidth="5.5" strokeLinecap="round" />
          <path d="M52 32L33 27L33 37Z" fill="#ffffff" />
          <path d="M26 32L33 27L33 37Z" fill="#ffffff" fillOpacity=".55" />
        </svg>
      );
    case "surebet":
      return (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <rect width="64" height="64" rx="16" fill="#22262a" />
          <path d="M14 42l11-11 7 7 17-17" fill="none" stroke="#d2a02a" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M39 21h10v10" fill="none" stroke="#d2a02a" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" />
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

/** Inline arrow icons. Text arrows like "↗" turn into emoji on iOS, so links use these instead. */
export function ArrowIcon({ direction = "right", size = 14 }: { direction?: "right" | "up-right"; size?: number }) {
  return (
    <svg
      className="arrow-icon"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "right" ? (
        <>
          <line x1="3" y1="8" x2="13" y2="8" />
          <polyline points="9,4 13,8 9,12" />
        </>
      ) : (
        <>
          <line x1="4.5" y1="11.5" x2="11.5" y2="4.5" />
          <polyline points="5.5,4.5 11.5,4.5 11.5,10.5" />
        </>
      )}
    </svg>
  );
}

/** Leading icons for action links; each part has a class so CSS can animate it on hover. */
export function ActionIcon({ kind }: { kind: "download" | "github" | "chat" | "app" | "school" }) {
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const
  };

  return (
    <svg className={`action-icon action-icon-${kind}`} width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      {kind === "download" ? (
        <>
          <g className="ai-arrow" {...stroke}>
            <line x1="12" y1="3.5" x2="12" y2="14.5" />
            <polyline points="7.5,10.5 12,15 16.5,10.5" />
          </g>
          <path className="ai-tray" {...stroke} d="M4 15.5v2.5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5" />
        </>
      ) : null}
      {kind === "github" ? (
        <path
          className="ai-octo"
          fill="currentColor"
          d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.69 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.39-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z"
        />
      ) : null}
      {kind === "chat" ? (
        <>
          <path className="ai-bubble" {...stroke} d="M21 11.5a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 11.5z" />
          <g className="ai-dots" fill="currentColor">
            <circle cx="9" cy="11.5" r="1.1" />
            <circle cx="12.5" cy="11.5" r="1.1" />
            <circle cx="16" cy="11.5" r="1.1" />
          </g>
        </>
      ) : null}
      {kind === "app" ? (
        <>
          <path className="ai-window" {...stroke} d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
          <g className="ai-launch" {...stroke}>
            <line x1="11" y1="13" x2="20" y2="4" />
            <polyline points="14,4 20,4 20,10" />
          </g>
        </>
      ) : null}
      {kind === "school" ? (
        <g className="ai-cap" {...stroke}>
          <path d="M2.5 9.5 12 5l9.5 4.5L12 14z" />
          <path d="M6.5 11.5v4c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4" />
          <line x1="21.5" y1="9.5" x2="21.5" y2="14.5" />
        </g>
      ) : null}
    </svg>
  );
}
