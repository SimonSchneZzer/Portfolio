import type { ReactNode } from "react";
import { site } from "@/content/site";
import "./error-screen.css";

type ErrorScreenProps = {
  code: string;
  title: string;
  children: ReactNode;
  /** Extra primary action rendered before the "back home" link, e.g. a retry button. */
  action?: ReactNode;
};

const elsewhere = [
  { label: "LinkedIn", href: site.sameAs[0] },
  { label: "GitHub", href: site.sameAs[1] }
];

/** Shared layout for 404 and error pages, so no error ever ends in a dead end. */
export function ErrorScreen({ code, title, children, action }: ErrorScreenProps) {
  return (
    <main className="error-screen">
      <section className="error-card surface" aria-labelledby="error-title">
        <p className="error-code" aria-hidden="true">
          {code}
        </p>
        <h1 id="error-title" className="error-title">
          {title}
        </h1>
        <div className="error-copy">{children}</div>

        <div className="hero-actions error-actions">
          {action}
          <a href="/" className={`hero-action ${action ? "hero-action-secondary" : "hero-action-primary"}`}>
            Back to the portfolio
          </a>
        </div>

        <p className="error-elsewhere">
          Or find me on{" "}
          {elsewhere.map((link, index) => (
            <span key={link.label}>
              {index > 0 ? " and " : null}
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </span>
          ))}
          .
        </p>
      </section>
    </main>
  );
}
