import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://earnora.co.ke";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/wallet", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
