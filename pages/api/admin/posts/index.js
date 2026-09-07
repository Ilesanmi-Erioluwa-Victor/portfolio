import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (req.method === "GET") {
    const posts = await prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        excerpt: true,
        coverImage: true,
      },
    });
    return res.json(posts);
  }

  if (req.method === "POST") {
    const { title, slug, excerpt, contentJson, contentHtml, coverImage, status } = req.body;

    if (!title || !slug) {
      return res.status(400).json({ error: "Title and slug are required" });
    }

    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug,
        excerpt: excerpt || "",
        contentJson,
        contentHtml,
        coverImage,
        status: status || "DRAFT",
        authorId: "admin", // will be replaced with session.user.id
      },
    });

    return res.status(201).json(post);
  }

  return res.status(405).json({ error: "Method not allowed" });
}