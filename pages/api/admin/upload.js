import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { presignUpload } from "../../../../lib/s3";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { filename, contentType, kind, postSlug } = req.body;

  if (!filename || !contentType) {
    return res.status(400).json({ error: "filename and contentType are required" });
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(contentType)) {
    return res.status(400).json({ error: "Invalid file type" });
  }

  if (filename.length > 255) {
    return res.status(400).json({ error: "Filename too long" });
  }

  try {
    let key;
    const ext = filename.split(".").pop().toLowerCase();

    if (kind === "cover") {
      const slug = req.body.postSlug || "cover";
      key = `blog/coverImages/${slug}.${ext}`;
    } else {
      const id = require("crypto").randomUUID().replace(/-/g, "").slice(0, 12);
      key = `blog/postImages/${id}.${ext}`;
    }

    const uploadUrl = await presignUpload(key, contentType);
    const publicUrl = `https://${process.env.AWS_CLOUDFRONT_DOMAIN}/${key}`;

    return res.json({ uploadUrl, publicUrl, key });
  } catch (err) {
    console.error("Presign error:", err);
    return res.status(500).json({ error: "Failed to generate upload URL" });
  }
}