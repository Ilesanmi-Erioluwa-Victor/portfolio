async function main() {
  const { validateUploadInput, isApprovedImageUrl, MAX_UPLOAD_BYTES } = await import("../lib/upload-validation.js");

  let failures = 0;

  function accept(name, input, wantExt) {
    const r = validateUploadInput(input);
    if (!r.ok || (wantExt && r.ext !== wantExt) || !r.key.endsWith(`.${r.ext}`) || /slug|post|cover|evil|\.\./i.test(r.key.replace("blog/coverImages/", "").replace("blog/postImages/", ""))) {
      failures += 1;
      console.log(`FAIL ${name}: ${JSON.stringify(r)}`);
    } else {
      console.log(`ok ${name} -> ${r.key}`);
    }
  }

  function reject(name, input, wantStatus) {
    const r = validateUploadInput(input);
    if (r.ok || r.status !== wantStatus) {
      failures += 1;
      console.log(`FAIL ${name}: expected ${wantStatus}, got ${JSON.stringify(r)}`);
    } else {
      console.log(`ok ${name} (${r.status}: ${r.error})`);
    }
  }

  accept("valid-jpeg", { kind: "inline", contentType: "image/jpeg", filename: "photo.jpg" }, "jpg");
  accept("valid-jpeg-alias", { kind: "inline", contentType: "image/jpeg", filename: "photo.jpeg" }, "jpg");
  accept("valid-png", { kind: "cover", contentType: "image/png", filename: "cover.png" }, "png");
  accept("valid-webp", { kind: "inline", contentType: "image/webp", filename: "upload.webp" }, "webp");
  accept("valid-gif", { kind: "inline", contentType: "image/gif", filename: "anim.gif" }, "gif");
  accept("no-filename", { kind: "inline", contentType: "image/webp" }, "webp");

  reject("html-file", { kind: "inline", contentType: "text/html", filename: "evil.html" }, 400);
  reject("svg-file", { kind: "inline", contentType: "image/svg+xml", filename: "evil.svg" }, 400);
  reject("js-file", { kind: "inline", contentType: "application/javascript", filename: "x.js" }, 400);
  reject("pdf-file", { kind: "inline", contentType: "application/pdf", filename: "doc.pdf" }, 400);
  reject("text-plain", { kind: "inline", contentType: "text/plain", filename: "note.txt" }, 400);
  reject("xhtml", { kind: "inline", contentType: "application/xhtml+xml", filename: "p.xhtml" }, 400);
  reject("unknown-mime", { kind: "inline", contentType: "application/octet-stream", filename: "b.bin" }, 400);
  reject("empty-mime", { kind: "inline", contentType: "", filename: "a.png" }, 400);
  reject("mismatch-png-as-jpg", { kind: "inline", contentType: "image/jpeg", filename: "photo.png" }, 400);
  reject("mismatch-html-as-webp", { kind: "inline", contentType: "image/webp", filename: "evil.html" }, 400);
  reject("mismatch-svg-as-png", { kind: "inline", contentType: "image/png", filename: "evil.svg" }, 400);
  reject("bad-kind", { kind: "avatar", contentType: "image/png", filename: "a.png" }, 400);
  reject("missing-kind", { contentType: "image/png", filename: "a.png" }, 400);

  const seen = new Set();
  for (let i = 0; i < 50; i++) {
    seen.add(validateUploadInput({ kind: "inline", contentType: "image/webp" }).key);
  }
  if (seen.size !== 50) {
    failures += 1;
    console.log("FAIL random-keys: collisions or predictable keys");
  } else {
    console.log("ok random-keys (50/50 unique, uuid, no client input in key)");
  }

  if (MAX_UPLOAD_BYTES !== 5 * 1024 * 1024) {
    failures += 1;
    console.log("FAIL size-limit constant");
  } else {
    console.log("ok size-limit 5MB enforced by S3 content-length-range condition");
  }

  const cdn = "abc123.cloudfront.net";
  const urlCases = [
    ["empty-clears", "", true],
    ["cloudfront-ok", "https://abc123.cloudfront.net/blog/coverImages/x.webp", true],
    ["evil-host", "https://evil.com/x.webp", false],
    ["http-downgrade", "http://abc123.cloudfront.net/x.webp", false],
    ["path-confusion", "https://abc123.cloudfront.net.evil.com/x.webp", false],
    ["non-string", 42, false],
  ];
  for (const [name, url, want] of urlCases) {
    const got = isApprovedImageUrl(url, cdn);
    if (got !== want) {
      failures += 1;
      console.log(`FAIL ${name}: got ${got}`);
    } else {
      console.log(`ok ${name}`);
    }
  }

  if (failures) {
    console.log(`\n${failures} FAILURE(S)`);
    process.exit(1);
  }
  console.log("\nall upload validation checks passed");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
