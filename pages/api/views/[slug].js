import { prisma } from "../../../../lib/db";

const BOT_REGEX = /bot|crawler|spider|googlebot|bingbot|ahrefsbot|yandexbot|duckduckbot/i;

function isBot(userAgent) {
  if (!userAgent) return true;
  return BOT_REGEX.test(userAgent.toLowerCase());
}

const recentlyViewedMap = new Map();

function recentlyViewed(ip, slug) {
  const key = `${ip}:${slug}`;
  const lastSeen = recentlyViewed.get(key);
  const now = Date.now();
  if (lastSeen && now - lastSeen < 60 * 60 * 1000) {
    return true;
  }
  recentlyViewedMap.set(key, now);
  return false;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { slug } = req.query;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const userAgent = req.headers["user-agent"] || "";

  if (isBot(userAgent)) {
    return res.status(200).json({ skipped: true, reason: "bot" });
  }

  // Check session - would need session check here
  // For now we'll rely on IP-based dedupe

  if (recentlyViewedMap.get(key)) {
    return res.status(200).json({ skipped: true, reason: "recently viewed" });
  }

  try {
    const post = await prisma.post.findUnique({ where: { slug } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    await prisma.$transaction([
      prisma.post.update({
        where: { slug },
        data: { views: { increment: 1 } },
      }),
      prisma.viewEvent.create({
        data: { postId: post.id, ip, userAgent: req.headers["user-agent"] || "" },
      }),
    ]);

    return res.json({ success: true, views: post.views + 1 });
  } catch (err) {
    console.error("View increment error:", err);
    return res.status(500).json({ error: "Failed to record view" });
  }
}