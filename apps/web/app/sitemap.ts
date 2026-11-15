import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Only the page itself. The CV PDF is intentionally left out (private contact details, marked noindex).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
