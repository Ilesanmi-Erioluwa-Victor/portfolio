import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import { isBot, recentlyViewed } from "../../../lib/views";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;
  const post = await prisma.post.findUnique({ where: { slug }, select: { id: true } });

  if (!post) {
    return res.status(404).json({ error: "Post not found" });
  }

  const session = await getServerSession(req, res, authOptions);
  if (session) {
    return res.status(200).json({ counted: false, skipped: true, reason: "admin" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  const userAgent = req.headers["user-agent"] || "";

  if (isBot(userAgent)) {
    return res.status(200).json({ counted: false, skipped: true, reason: "bot" });
  }

  if (recentlyViewed(ip, slug)) {
    const row = await prisma.post.findUnique({ where: { id: post.id }, select: { views: true } });
    return res.status(200).json({ counted: false, skipped: true, reason: "dedupe", views: row?.views ?? 0 });
  }

  try {
    const updated = await prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
      select: { views: true },
    });

    await prisma.viewEvent.create({
      data: { postId: post.id, ip, userAgent: userAgent.slice(0, 500) },
    });

    res.status(200).json({ counted: true, views: updated.views });
  } catch (err) {
    console.error("recordView failed:", err);
    res.status(500).json({ counted: false, error: "Failed to record view" });
  }
}