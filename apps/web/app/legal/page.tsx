import type { Metadata } from "next";
import Link from "next/link";
import "../projects/[slug]/project-page.css";
import "./legal-page.css";

// Imprint (§ 25 MedienG, small website) and privacy notice (GDPR Art. 13).
// Keep this in sync with what the site really does: visit counter (components/visit-counter.tsx, GoatCounter on the
// home server), access logs (Caddy, masked IPs), chat (apps/api, Cloudflare Workers AI) and sessionStorage (Vorleser toast).
export const metadata: Metadata = {
  title: "Imprint & Privacy – Simon Schnetzer",
  description: "Imprint and privacy notice for simon.schnetzer.at.",
  alternates: { canonical: "/legal" },
  robots: { index: false, follow: true }
};

const contactEmail = "simon@schnetzer.at";
const lastUpdated = "17 November 2026";

export default function LegalPage() {
  return (
    <main className="project-page legal-page">
      <nav className="project-page-nav" aria-label="Breadcrumb">
        <Link href="/">← Simon Schnetzer</Link>
      </nav>

      <article className="project-page-card surface">
        <section id="imprint" className="legal-section">
          <p className="section-kicker">Impressum</p>
          <h1>Imprint</h1>
          <p>
            Information according to § 25 of the Austrian Media Act (MedienG).
          </p>
          <dl className="legal-facts">
            <dt>Media owner and responsible for content</dt>
            <dd>Simon Schnetzer, Salzburg, Austria</dd>
            <dt>Contact</dt>
            <dd>
              <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
            </dd>
            <dt>Purpose of this website</dt>
            <dd>Personal portfolio: information about my work, projects and professional background.</dd>
          </dl>
        </section>

        <section id="privacy" className="legal-section">
          <p className="section-kicker">Datenschutz</p>
          <h1>Privacy</h1>
          <p>
            This website collects as little as possible. It sets no cookies, uses no advertising or tracking services and
            does not build profiles of visitors. The details:
          </p>

          <h2>Who is responsible</h2>
          <p>
            Simon Schnetzer, Salzburg, Austria, <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
          </p>

          <h2>Hosting and server logs</h2>
          <p>
            The website runs on my own server in Austria. When you open a page, your browser sends technical data such as
            the IP address, the requested address, the time, the browser and the referring page. The web server writes
            this to a log file to keep the site secure and working. The IP address is shortened before it is saved (the
            last two parts of an IPv4 address are removed), the log files are deleted after 14 days at the latest.
          </p>
          <p>Legal basis: legitimate interest in a secure and working website (Art. 6(1)(f) GDPR).</p>

          <h2>Visitor statistics</h2>
          <p>
            To know how many people visit the site and which pages they look at, I use GoatCounter, an open-source
            counter that runs on the same server. No data goes to third parties. It sets no cookies and does not store
            IP addresses. What is stored: the page, the referring website, the browser and operating system, the screen
            size and the country (derived from the IP address, which is then discarded). To count a visitor only once,
            a short-lived, anonymous fingerprint is kept for at most eight hours. The statistics cannot be linked to a
            person.
          </p>
          <p>Legal basis: legitimate interest in understanding how the site is used (Art. 6(1)(f) GDPR).</p>

          <h2>Chat</h2>
          <p>
            If you write in the chat, your messages are sent to my server and from there to{" "}
            Cloudflare Workers AI (Cloudflare, Inc., USA), which generates the answers. Cloudflare
            processes the messages on my behalf; your IP address is not passed on. Cloudflare is certified under the
            EU-U.S. Data Privacy Framework. If Cloudflare is not available, the answer is generated on my own server
            instead. I do not store the conversations; they are gone when you close the page. To prevent abuse, the
            server keeps the number of messages per IP address in memory for one hour. Please do not enter personal or
            sensitive information in the chat.
          </p>
          <p>Legal basis: your request (Art. 6(1)(b) GDPR) and legitimate interest in preventing abuse (Art. 6(1)(f) GDPR).</p>

          <h2>Stored in your browser</h2>
          <p>
            The site remembers in your browser&apos;s session storage whether you have already closed the notice about
            the Vorleser project. This is not sent anywhere and is deleted when you close the tab.
          </p>

          <h2>Links to other websites</h2>
          <p>
            Links to LinkedIn, GitHub, FH Salzburg and other sites only open when you click them. From then on, the
            privacy policy of that site applies.
          </p>

          <h2>Your rights</h2>
          <p>
            You have the right to access, rectification, erasure, restriction of processing, data portability and to
            object (Art. 15–21 GDPR). Write to <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. You can also
            lodge a complaint with the Austrian Data Protection Authority (Datenschutzbehörde,{" "}
            <a href="https://www.dsb.gv.at" target="_blank" rel="noopener noreferrer">
              dsb.gv.at
            </a>
            ).
          </p>

          <p className="legal-updated">Last updated: {lastUpdated}</p>
        </section>
      </article>
    </main>
  );
}
