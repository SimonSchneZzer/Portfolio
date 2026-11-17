import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/case-studies";
import { site } from "@/content/site";

// The CV PDF is intentionally left out (marked noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    // The apps on the same domain (served by their own containers, not by Next.js)
    { url: `${site.url}/compass/`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${site.url}/vorleser/`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    ...caseStudies.map((study) => ({
      url: `${site.url}/projects/${study.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8
    }))
  ];
}
