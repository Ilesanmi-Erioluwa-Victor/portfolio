/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://ilesanmi.vercel.app",
  generateRobotsTxt: true,
  changefreq: "monthly",
  priority: 0.7,
  sitemapSize: 5000,

  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },

  exclude: ["/api/*", "/Resume.pdf", "/google*"],

  transform: async (config, path) => {
    let priority = config.priority ?? 0.7;
    let changefreq = config.changefreq ?? "monthly";

    if (path === "/") {
      priority = 1.0;
    } else if (path === "/resume" || path === "/blog") {
      priority = 0.8;
    } else if (path.startsWith("/blog/")) {
      priority = 0.6;
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },

  additionalPaths: async () => {
    const slugs = [
      "building-scalable-react-apps",
      "real-time-features-with-websockets",
      "ci-cd-pipelines-for-startups",
    ];
    const now = new Date().toISOString();
    return slugs.map((slug) => ({
      loc: `/blog/${slug}`,
      changefreq: "monthly",
      priority: 0.6,
      lastmod: now,
    }));
  },
};
