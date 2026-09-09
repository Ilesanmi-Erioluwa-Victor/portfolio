const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

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
    const [posts, tags] = await Promise.all([
      prisma.post.findMany({
        where: { status: "PUBLISHED", publishedAt: { lte: new Date() } },
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
      prisma.tag.findMany({ select: { slug: true } }),
    ]);
    return [
      ...posts.map((post) => ({
        loc: `/blog/${post.slug}`,
        changefreq: "monthly",
        priority: 0.6,
        lastmod: post.updatedAt
          ? new Date(post.updatedAt).toISOString()
          : post.publishedAt
            ? new Date(post.publishedAt).toISOString()
            : new Date().toISOString(),
      })),
      ...tags.map((tag) => ({
        loc: `/blog/tag/${tag.slug}`,
        changefreq: "weekly",
        priority: 0.5,
        lastmod: new Date().toISOString(),
      })),
    ];
  },
};
