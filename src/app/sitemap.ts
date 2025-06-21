import { MetadataRoute } from "next";

const sitemap = (): MetadataRoute.Sitemap => [
  {
    url: "https://malviys.com",
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  },
  {
    url: "http://malviys.com",
    lastModified: new Date(),
    changeFrequency: "yearly",
    priority: 1,
  }
];

export default sitemap;
