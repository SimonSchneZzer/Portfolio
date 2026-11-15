"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/error-screen";
import "./globals.css";

/** Replaces the root layout when the layout itself fails, so it must render its own <html> and <body>. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <title>Something went wrong – Simon Schnetzer</title>
        <ErrorScreen
          code="500"
          title="Something went sideways."
          action={
            <button type="button" className="hero-action hero-action-primary" onClick={reset}>
              Try again
            </button>
          }
        >
          <p>An unexpected error interrupted the site. Trying again usually fixes it.</p>
          {error.digest ? (
            <p>
              If it keeps happening, this reference helps me find it: <code>{error.digest}</code>
            </p>
          ) : null}
        </ErrorScreen>
      </body>
    </html>
  );
}
