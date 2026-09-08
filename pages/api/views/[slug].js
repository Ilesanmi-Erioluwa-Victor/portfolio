import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import { recordView } from "../../../lib/views";

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
    return res.status(200).json({ skipped: true, reason: "admin" });
  }

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"] || "";

  const counted = await recordView({ prisma, postId: post.id, ip, userAgent });

  res.status(200).json({ counted });
}