import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { MAX_UPLOAD_BYTES } from "./upload-validation";

const s3 = new S3Client({ region: process.env.AWS_REGION || "af-south-1" });
const bucket = process.env.AWS_S3_BUCKET;
const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;

export function presignUploadPost(key, contentType) {
  return createPresignedPost(
    s3,
    {
      Bucket: bucket,
      Key: key,
      Conditions: [
        ["content-length-range", 1, MAX_UPLOAD_BYTES],
        ["eq", "$Content-Type", contentType],
      ],
      Fields: { "Content-Type": contentType },
      Expires: 300,
    }
  );
}

export function getPublicUrl(key) {
  return `https://${cloudfrontDomain}/${key}`;
}
