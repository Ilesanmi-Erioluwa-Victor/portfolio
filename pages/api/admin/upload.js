import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import {
  presignUpload,
  getPublicUrl,
  generateCoverKey,
  generateInlineKey,
  getExtFromFilename,
} from "../../../lib/s3";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { kind, filename, contentType, postSlug } = req.body;

  if (!kind || !filename || !contentType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  if (!["cover", "inline"].includes(kind)) {
    return res.status(400).json({ error: "Invalid kind" });
  }

  const ext = getExtFromFilename(filename);
  let key;

  if (kind === "cover") {
    if (!postSlug?.trim()) {
      return res.status(400).json({ error: "postSlug required for cover images. Save the post slug first." });
    }
    key = generateCoverKey(postSlug.trim(), ext);
  } else {
    key = generateInlineKey(ext);
  }

  if (!process.env.AWS_S3_BUCKET || !process.env.AWS_CLOUDFRONT_DOMAIN) {
    return res.status(500).json({ error: "S3 not configured. Set AWS_S3_BUCKET and AWS_CLOUDFRONT_DOMAIN." });
  }

  try {
    const uploadUrl = await presignUpload(key, contentType);
    const publicUrl = getPublicUrl(key);
    res.status(200).json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("presignUpload failed:", err);
    res.status(500).json({ error: "Could not create upload URL. Check AWS credentials/region." });
  }
}