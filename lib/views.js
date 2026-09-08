const BOT_REGEX = /(googlebot|bingbot|ahrefsbot|yandexbot|duckduckbot|bot|crawler|spider)/i;

const recentViews = new Map();

export function recentlyViewed(ip, slug) {
  const key = `${ip}:${slug}`;
  const lastSeen = recentViews.get(key);
  if (lastSeen && Date.now() - lastSeen < 60 * 60 * 1000) {
    return true;
  }
  recentViews.set(key, Date.now());
  return false;
}

export function isBot(userAgent) {
  if (!userAgent) return false;
  return BOT_REGEX.test(userAgent);
}

export async function recordView({ prisma, postId, ip, userAgent }) {
  if (isBot(userAgent)) return false;

  await prisma.post.update({
    where: { id: postId },
    data: { views: { increment: 1 } },
  });

  await prisma.viewEvent.create({
    data: { postId, ip, userAgent },
  });

  return true;
}