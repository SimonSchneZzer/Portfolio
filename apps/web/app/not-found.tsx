import type { Metadata } from "next";
import { ErrorScreen } from "@/components/error-screen";

export const metadata: Metadata = {
  title: "Page not found – Simon Schnetzer",
  robots: { index: false, follow: true }
};

export default function NotFound() {
  return (
    <ErrorScreen code="404" title="This page took a different route.">
      <p>The link might be outdated, or the address has a small typo. Nothing is broken, it just isn&apos;t here.</p>
      <p>Everything about my work, projects and CV is on the main page, and the chat there answers questions about me.</p>
    </ErrorScreen>
  );
}
