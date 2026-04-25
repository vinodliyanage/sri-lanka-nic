import { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { DOCS_NAV } from "@/app/docs/layout";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/docs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const docsRoutes: MetadataRoute.Sitemap = DOCS_NAV.map((doc) => ({
    url: `${siteConfig.url}/docs/${doc.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...routes, ...docsRoutes];
}
