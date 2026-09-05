import { ImageResponse } from "next/og";

export const runtime = "edge";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };
export const alt = "Ilesanmi Erioluwa Victor — portfolio article";

export default async function GET(req) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || "Ilesanmi Erioluwa Victor").slice(0, 200);
  const tags = (searchParams.get("tags") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 4);
  const site = "ilesanmi.vercel.app";

  const ink = "#0a0a0a";
  const muted = "#5d5d5d";
  const bg = "#ededed";
  const accent = "#2ECC71";

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
            marginTop: 56,
            gap: 24,
            maxWidth: 1040,
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.1,
              letterSpacing: -2,
              color: ink,
              display: "flex",
            }}
          >
            {title}
          </div>
          {tags.length > 0 && (
            <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
              {tags.map((tag) => (
                <div
                  key={tag}
                  style={{
                    display: "flex",
                    padding: "8px 18px",
                    borderRadius: 999,
                    border: `1px solid rgba(10,10,10,0.12)`,
                    background: "rgba(10,10,10,0.04)",
                    fontSize: 22,
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
