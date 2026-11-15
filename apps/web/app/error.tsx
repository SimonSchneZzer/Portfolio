"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/error-screen";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      code="500"
      title="Something went sideways."
      action={
        <button type="button" className="hero-action hero-action-primary" onClick={reset}>
          Try again
        </button>
      }
    >
      <p>An unexpected error interrupted this page. Trying again usually fixes it.</p>
      {error.digest ? (
        <p>
          If it keeps happening, this reference helps me find it: <code>{error.digest}</code>
        </p>
      ) : null}
    </ErrorScreen>
  );
}
