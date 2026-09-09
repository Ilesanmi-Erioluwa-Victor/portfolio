import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    return res.status(200).json(tags);
  }

  if (req.method === "POST") {
    const { name } = req.body || {};
    if (!name?.trim()) {
      return res.status(400).json({ error: "Tag name is required" });
    }
    const cleanName = name.trim().slice(0, 40);
    let slug = slugify(cleanName);
    if (!slug) {
      return res.status(400).json({ error: "Tag name must contain letters or numbers" });
    }
    const existing = await prisma.tag.findFirst({
      where: { OR: [{ slug }, { name: cleanName }] },
    });
    if (existing) {
      return res.status(200).json(existing);
    }
    let unique = slug;
    let counter = 1;
    while (await prisma.tag.findUnique({ where: { slug: unique } })) {
      unique = `${slug}-${counter++}`;
    }
    const tag = await prisma.tag.create({
      data: { slug: unique, name: cleanName },
    });
    return res.status(201).json(tag);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}
