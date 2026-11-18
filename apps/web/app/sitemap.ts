import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/case-studies";
import { site } from "@/content/site";

// The CV PDF is intentionally left out (marked noindex).
// lastmod = the real date of the last content change (site.updated, study.updated), not "now" – search engines
// ignore lastmod that changes on every request. The apps on the same domain update on their own, so they get none.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: site.updated, changeFrequency: "monthly", priority: 1 },
    // The apps on the same domain (served by their own containers, not by Next.js)
    { url: `${site.url}/compass/`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/vorleser/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/surebet/`, changeFrequency: "daily", priority: 0.7 },
    ...caseStudies.map((study) => ({
      url: `${site.url}/projects/${study.slug}`,
      lastModified: study.updated,
      changeFrequency: "monthly" as const,
      priority: 0.8
    }))
  ];
}
