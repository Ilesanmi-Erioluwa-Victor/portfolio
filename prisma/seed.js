import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL;

if (!adminEmail) {
  console.error("ADMIN_EMAIL env var is required for the seed script.");
  process.exit(1);
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Ilesanmi",
    },
  });

  console.log(`Seeded admin user: ${user.email}`);

  const tagSlugs = [
    { slug: "react", name: "React" },
    { slug: "node-js", name: "Node.js" },
    { slug: "devops", name: "DevOps" },
    { slug: "aws", name: "AWS" },
    { slug: "architecture", name: "Architecture" },
    { slug: "websockets", name: "WebSockets" },
  ];

  for (const tag of tagSlugs) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: tag,
    });
  }

  console.log(`Seeded ${tagSlugs.length} tags.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });