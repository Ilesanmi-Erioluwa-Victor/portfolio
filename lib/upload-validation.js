import { randomUUID } from "crypto";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const MIME_TO_EXT = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export const EXT_TO_MIME = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function extOfFilename(filename) {
  if (typeof filename !== "string") return "";
  const base = filename.split(/[\\/]/).pop() || "";
  const dot = base.lastIndexOf(".");
  if (dot <= 0 || dot === base.length - 1) return "";
  return base.slice(dot + 1).toLowerCase();
}

export function validateUploadInput({ kind, contentType, filename }) {
  if (kind !== "cover" && kind !== "inline") {
    return { ok: false, status: 400, error: "Invalid kind" };
  }

  const mime = typeof contentType === "string" ? contentType.trim().toLowerCase() : "";
  const ext = MIME_TO_EXT[mime];
  if (!ext) {
    return { ok: false, status: 400, error: "Unsupported content type. Allowed: image/jpeg, image/png, image/webp, image/gif." };
  }

  if (filename !== undefined && filename !== null && String(filename).trim() !== "") {
    const fileExt = extOfFilename(String(filename));
    if (fileExt && !EXT_TO_MIME[fileExt]) {
      return { ok: false, status: 400, error: `Filename extension .${fileExt} is not allowed.` };
    }
    if (fileExt && EXT_TO_MIME[fileExt] !== mime) {
      return { ok: false, status: 400, error: "Filename extension does not match content type." };
    }
  }

  const prefix = kind === "cover" ? "blog/coverImages" : "blog/postImages";
  return { ok: true, ext, mime, key: `${prefix}/${randomUUID()}.${ext}` };
}

export function isApprovedImageUrl(url, cloudfrontDomain) {
  if (url === "" || url === null || url === undefined) return true;
  if (typeof url !== "string" || !cloudfrontDomain) return false;
  return url.startsWith(`https://${cloudfrontDomain}/`);
}
