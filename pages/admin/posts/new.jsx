import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";

function slugify(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function AdminNewPost({ session }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const slug = useMemo(() => slugify(title), [title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Please enter a title.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: cleanTitle, excerpt: excerpt.trim(), status: "DRAFT" }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create post");
      }
      router.push(`/admin/posts/${data.id}`);
    } catch (err) {
      setError(err.message || "Failed to create post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-index" style={{ maxWidth: "720px" }}>
      <div className="admin-header">
        <div>
          <Link href="/admin/posts" className="blog-back" style={{ marginBottom: "8px", display: "inline-flex" }}>
            ← All posts
          </Link>
          <h1>New post</h1>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "var(--muted)" }}>
            Step 1 of 3 — Create draft, then write and publish.
          </p>
        </div>
        <span style={{ fontSize: "13px", color: "var(--muted)" }}>{session.user?.email}</span>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", fontSize: "13px", color: "var(--muted)" }}>
        <span style={{ fontWeight: 600, color: "var(--ink)" }}>1. Create</span>
        <span>→</span>
        <span>2. Write</span>
        <span>→</span>
        <span>3. Publish</span>
      </div>

      <div className="posts-table" style={{ padding: "24px" }}>
        <form className="new-post-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Title <span style={{ color: "var(--muted)", fontWeight: 400 }}>· {title.trim().length}/120</span>
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              placeholder="e.g. Building scalable React applications"
              required
              autoFocus
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
            />
            <p className="form-hint">
              URL preview: /blog/<strong>{slug || "your-post-title"}</strong>
            </p>
          </div>

          <div className="form-group">
            <label htmlFor="excerpt" className="form-label">
              Excerpt <span style={{ color: "var(--muted)", fontWeight: 400 }}>· optional · {excerpt.trim().length}/160</span>
            </label>
            <textarea
              id="excerpt"
              className="form-textarea"
              placeholder="One-line summary for listings, SEO, and social previews…"
              rows={3}
              maxLength={160}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              disabled={loading}
            />
          </div>

          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}

          <div style={{ display: "flex", gap: "12px" }}>
            <Link href="/admin/posts" className="btn btn-secondary" style={{ flex: "0 0 auto", height: "48px" }}>
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1, height: "48px", fontSize: "15px", opacity: loading ? 0.7 : 1 }}
              disabled={loading || !title.trim()}
            >
              {loading ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  Creating draft…
                </span>
              ) : (
                "Create draft →"
              )}
            </button>
          </div>
        </form>
      </div>

      <div style={{ marginTop: "16px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px 20px", fontSize: "14px", color: "var(--muted)" }}>
        After creation you will be taken to the editor to add content, cover image, and tags. Nothing is public until you hit Publish.
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("../../../lib/auth");
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: { destination: "/admin/login", permanent: false },
    };
  }

  return { props: { session } };
}
