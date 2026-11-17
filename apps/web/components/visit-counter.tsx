"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Privacy-friendly visit counter: self-hosted GoatCounter on the home server, reached via /c/.
// No cookies, no stored IP addresses. Counts the first load and every client-side page change.
type GoatCounter = { count?: (vars: { path: string }) => void };
declare global {
  interface Window {
    goatcounter?: GoatCounter;
  }
}

let lastCounted: string | null = null;

function count(path: string) {
  if (!window.goatcounter?.count || path === lastCounted) return;
  lastCounted = path;
  window.goatcounter.count({ path });
}

export function VisitCounter() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) count(pathname);
  }, [pathname]);

  return (
    <Script
      src="/c/count.js"
      data-goatcounter="/c/count"
      // The script must not count on its own; this component does it (also for client-side navigation).
      data-goatcounter-settings='{"no_onload": true}'
      strategy="afterInteractive"
      onLoad={() => count(window.location.pathname)}
    />
  );
}
