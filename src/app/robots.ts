import type { MetadataRoute } from "next";

const robots = (): MetadataRoute.Robots => ({
  rules: {
    userAgent: "*",
    allow: "/",
  },
  sitemap: "https://malviys.com/sitemap.xml",
  host: "https://malviys.com",
});

export default robots;
