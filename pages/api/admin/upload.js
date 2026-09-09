import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { presignUploadPost, getPublicUrl } from "../../../lib/s3";
import { validateUploadInput } from "../../../lib/upload-validation";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prisma } = await import("../../../lib/db");

  let authorId = session.user?.id;
  if (!authorId && session.user?.email) {
    const me = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    authorId = me?.id;
  }
  if (!authorId) {
    return res.status(401).json({ error: "No user record for this session. Sign out and sign in again." });
  }

  const { kind, filename, contentType, postSlug } = req.body || {};

  const checked = validateUploadInput({ kind, contentType, filename });
  if (!checked.ok) {
    return res.status(checked.status).json({ error: checked.error });
  }

  if (kind === "cover" && !postSlug?.trim()) {
    return res.status(400).json({ error: "postSlug required for cover images. Save the post slug first." });
  }

  if (postSlug?.trim()) {
    const target = await prisma.post.findUnique({
      where: { slug: postSlug.trim() },
      select: { id: true, authorId: true },
    });
    if (!target) {
      return res.status(404).json({ error: "Post not found." });
    }
    if (target.authorId !== authorId) {
      return res.status(403).json({ error: "You do not own this post." });
    }
  }

  if (!process.env.AWS_S3_BUCKET || !process.env.AWS_CLOUDFRONT_DOMAIN) {
    return res.status(500).json({ error: "S3 not configured. Set AWS_S3_BUCKET and AWS_CLOUDFRONT_DOMAIN." });
  }

  try {
    const { url, fields } = await presignUploadPost(checked.key, checked.mime);
    res.status(200).json({
      url,
      fields,
      publicUrl: getPublicUrl(checked.key),
      key: checked.key,
      contentType: checked.mime,
    });
  } catch (err) {
    console.error("presignUploadPost failed:", err);
    res.status(500).json({ error: "Could not create upload URL. Check AWS credentials/region." });
  }
}
