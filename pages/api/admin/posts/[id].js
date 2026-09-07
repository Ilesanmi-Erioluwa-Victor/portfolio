import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;

  if (req.method === "GET") {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { tags: true, author: true },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.json(post);
  }

  if (req.method === "PATCH") {
    const { title, slug, excerpt, contentJson, contentHtml, coverImage, status } = req.body;

    if (slug) {
      const existing = await prisma.post.findFirst({
        where: { slug, NOT: { id } },
      });
      if (existing) {
        return res.status(400).json({ error: "Slug already exists" });
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        contentJson,
        contentHtml,
        coverImage,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : undefined,
      },
    });
    return res.json(post);
  }

  if (req.method === "DELETE") {
    await prisma.post.delete({ where: { id } });
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Method not allowed" });
}