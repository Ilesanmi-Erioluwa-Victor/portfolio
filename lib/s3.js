import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION || "af-south-1" });
const bucket = process.env.AWS_S3_BUCKET;
const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;

export function presignUpload(key, contentType) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: 300 });
}

export function getPublicUrl(key) {
  return `https://${cloudfrontDomain}/${key}`;
}

export function generateCoverKey(slug, ext) {
  return `blog/coverImages/${slug}.${ext}`;
}

export function generateInlineKey(ext) {
  const random = Math.random().toString(36).substring(2, 15);
  return `blog/postImages/${random}.${ext}`;
}

export function getExtFromFilename(filename) {
  return filename.split(".").pop().toLowerCase();
}