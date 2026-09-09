import { ImageResponse } from "next/og";

export const runtime = "edge";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Ilesanmi Erioluwa Victor — portfolio article";

export default async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Ilesanmi Erioluwa Victor").slice(0, 90);
  const desc = (searchParams.get("desc") || "").slice(0, 160);
  const tags = (searchParams.get("tags") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);
  const site = "ilesanmi.vercel.app";

  const ink = "#0a0a0a";
  const muted = "#5d5d5d";
  const bg = "#ededed";
  const accent = "#2ECC71";

  const titleSize = title.length <= 40 ? 68 : title.length <= 70 ? 56 : 48;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: bg,
          padding: "72px 80px",
          fontFamily: "Helvetica, Arial, sans-serif",
          color: ink,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: muted,
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: accent,
              display: "flex",
            }}
          />
          Ilesanmi · Notes
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            gap: 20,
            maxWidth: 1040,
            flexShrink: 1,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 700,
              lineHeight: 1.15,
              letterSpacing: -0.5,
              color: ink,
              display: "flex",
            }}
          >
            {title}
          </div>
          {desc && (
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.4,
                color: "#444",
                display: "flex",
                maxWidth: 960,
              }}
            >
              {desc}
            </div>
          )}
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    padding: "6px 16px",
                    borderRadius: 999,
                    border: `1px solid rgba(10,10,10,0.12)`,
                    background: "rgba(10,10,10,0.04)",
                    fontSize: 20,
                    color: muted,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  }}
                >
                  {tag}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: muted,
          }}
        >
          <div style={{ display: "flex" }}>Ilesanmi Erioluwa Victor</div>
          <div style={{ display: "flex", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
            {site}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
