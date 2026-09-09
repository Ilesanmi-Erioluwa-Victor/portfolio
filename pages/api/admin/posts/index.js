import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    const posts = await prisma.post.findMany({
      where: { authorId: session.user.id },
      include: { tags: true },
      orderBy: { updatedAt: "desc" },
    });
    return res.status(200).json(posts);
  }

  if (req.method === "POST") {
    const { title, excerpt, contentJson, tags, status = "DRAFT" } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    let authorId = session.user?.id;
    if (!authorId && session.user?.email) {
      const author = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      authorId = author?.id;
    }
    if (!authorId) {
      return res.status(500).json({ error: "Signed in but no user record found. Sign out and sign in again." });
    }

    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    let slug = baseSlug;
    let counter = 1;
    while (await prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const post = await prisma.post.create({
      data: {
        slug,
        title,
        excerpt: excerpt || "",
        contentJson: contentJson || { type: "doc", content: [] },
        contentHtml: "",
        status,
        authorId,
        tags: tags?.length ? { connect: tags.map((id) => ({ id })) } : undefined,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
      },
      include: { tags: true },
    });

    if (status === "PUBLISHED") {
      try {
        await res.revalidate("/blog");
        await res.revalidate(`/blog/${slug}`);
      } catch {}
    }

    return res.status(201).json(post);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}