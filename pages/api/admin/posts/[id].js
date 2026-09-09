import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  const post = await prisma.post.findUnique({
    where: { id },
    include: { tags: true },
  });

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  if (post.authorId !== session.user.id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (req.method === "GET") {
    return res.status(200).json(post);
  }

  if (req.method === "PATCH") {
    const { title, slug, excerpt, contentJson, contentHtml, coverImage, status, tags, publishedAt } = req.body;

    const wasPublished = post.status === "PUBLISHED";
    const willBePublished = status === "PUBLISHED";
    const isPublishingNow = !wasPublished && willBePublished;
    const isUnpublishing = wasPublished && !willBePublished;

    const updated = await prisma.post.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(slug && { slug }),
        ...(excerpt !== undefined && { excerpt }),
        ...(contentJson && { contentJson }),
        ...(contentHtml !== undefined && { contentHtml }),
        ...(coverImage !== undefined && { coverImage }),
        ...(status && { status }),
        ...(tags && { tags: { set: tags.map((tagId) => ({ id: tagId })) } }),
        ...(isPublishingNow && { publishedAt: new Date() }),
        ...(isUnpublishing && { publishedAt: null }),
        ...(publishedAt && { publishedAt: new Date(publishedAt) }),
      },
      include: { tags: true },
    });

    if (isPublishingNow || isUnpublishing || (wasPublished && contentJson)) {
      try {
        await res.revalidate("/blog");
        await res.revalidate(`/blog/${updated.slug}`);
      } catch {}
    }

    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    await prisma.post.delete({ where: { id } });
    if (post.status === "PUBLISHED") {
      try {
        await res.revalidate("/blog");
        await res.revalidate(`/blog/${post.slug}`);
      } catch {}
    }
    return res.status(204).end();
  }

  res.setHeader("Allow", ["GET", "PATCH", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed" });
}