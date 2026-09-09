async function main() {
  const apply = process.argv.includes("--apply");

  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("@prisma/client");
  const { sanitizePostHtml } = await import("../lib/sanitize.js");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const posts = await prisma.post.findMany({
      select: { id: true, slug: true, status: true, contentHtml: true },
    });

    let dirty = 0;
    for (const post of posts) {
      const clean = sanitizePostHtml(post.contentHtml || "");
      if (clean !== (post.contentHtml || "")) {
        dirty += 1;
        console.log(`${apply ? "FIXED" : "WOULD-FIX"} ${post.status} ${post.slug} (${post.id})`);
        if (apply) {
          await prisma.post.update({
            where: { id: post.id },
            data: { contentHtml: clean },
          });
        }
      }
    }

    console.log(`\n${dirty}/${posts.length} posts need sanitizing.`);
    if (!apply && dirty) {
      console.log("Dry run only — re-run with --apply to write changes.");
    }
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
