import type { Metadata } from "next";
import type { ReactNode } from "react";
import { site } from "@/content/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  alternates: { canonical: "/" },
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  keywords: [
    "Simon Schnetzer",
    "Frontend Developer",
    "Frontend Developer Salzburg",
    "React",
    "Next.js",
    "TypeScript",
    "UI/UX",
    "AI interfaces",
    "Portfolio"
  ],
  openGraph: {
    type: "profile",
    url: "/",
    siteName: site.name,
    title: site.title,
    description: site.description,
    locale: "en_US",
    firstName: "Simon",
    lastName: "Schnetzer"
  },
  twitter: {
    card: "summary_large_image",
    title: site.title,
    description: site.description
  },
  robots: { index: true, follow: true }
};

// Structured data so search engines understand who this page is about (and can tell him apart from namesakes).
const personJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${site.url}/#person`,
      name: site.name,
      url: site.url,
      image: `${site.url}/images/simon-portrait.jpg`,
      jobTitle: site.jobTitle,
      worksFor: { "@type": "Organization", name: site.employer.name, url: site.employer.url },
      alumniOf: { "@type": "CollegeOrUniversity", name: "FH Salzburg – University of Applied Sciences" },
      address: { "@type": "PostalAddress", addressLocality: site.locality, addressCountry: site.country },
      knowsAbout: site.knowsAbout,
      sameAs: site.sameAs
    },
    {
      "@type": "ProfilePage",
      "@id": `${site.url}/#profile`,
      url: site.url,
      name: site.title,
      description: site.description,
      inLanguage: "en",
      mainEntity: { "@id": `${site.url}/#person` }
    }
  ]
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
