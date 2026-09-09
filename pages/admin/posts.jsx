import { useMemo, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const FILTERS = ["All", "DRAFT", "PUBLISHED", "ARCHIVED"];

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  const variants = {
    DRAFT: "badge-draft",
    PUBLISHED: "badge-published",
    ARCHIVED: "badge-archived",
  };
  return <span className={`badge ${variants[status] || "badge-draft"}`}>{status}</span>;
}

export default function AdminPosts({ posts: initialPosts, session }) {
  const [posts, setPosts] = useState(initialPosts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);

  const stats = useMemo(() => {
    const total = posts.length;
    const published = posts.filter((p) => p.status === "PUBLISHED").length;
    const drafts = posts.filter((p) => p.status === "DRAFT").length;
    const views = posts.reduce((sum, p) => sum + (p.views || 0), 0);
    return { total, published, drafts, views };
  }, [posts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (status !== "All" && p.status !== status) return false;
      if (!q) return true;
      return (
        p.title?.toLowerCase().includes(q) ||
        p.slug?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q)
      );
    });
  }, [posts, query, status]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title || "Untitled"}"? This cannot be undone.`)) return;
    setDeletingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete post");
      }
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      setError(err.message || "Failed to delete post");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="admin-index">
      <div className="admin-header">
        <div>
          <Link href="/admin" className="blog-back" style={{ marginBottom: "8px", display: "inline-flex" }}>
            ← Dashboard
          </Link>
          <h1>Posts</h1>
          <p style={{ margin: "4px 0 0", fontSize: "14px", color: "var(--muted)" }}>
            {stats.total} total · {stats.published} published · {stats.drafts} drafts · {stats.views.toLocaleString()} views
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "13px", color: "var(--muted)" }}>{session.user?.email}</span>
          <button type="button" className="btn btn-ghost" onClick={() => signOut({ callbackUrl: "/admin/login" })}>
            Sign out
          </button>
          <Link href="/admin/posts/new" className="btn btn-primary">
            + New post
          </Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Total posts", value: stats.total },
          { label: "Published", value: stats.published },
          { label: "Drafts", value: stats.drafts },
          { label: "Total views", value: stats.views.toLocaleString() },
        ].map((s) => (
          <div key={s.label} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "16px 18px" }}>
            <div style={{ fontSize: "22px", fontWeight: 600, color: "var(--ink)" }}>{s.value}</div>
            <div style={{ fontSize: "12px", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: "4px" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, slug, or excerpt…"
          style={{ flex: "1 1 240px", height: "40px", padding: "0 16px", borderRadius: "999px", border: "1px solid var(--border)", background: "var(--surface)", color: "var(--ink)", fontSize: "14px" }}
        />
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setStatus(f)}
              className={`btn ${status === f ? "btn-primary" : "btn-secondary"}`}
              style={{ height: "36px", padding: "0 14px" }}
            >
              {f === "All" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" style={{ color: "#ef4444", fontSize: "14px", margin: "0 0 12px" }}>
          {error}
        </p>
      )}

      {!filtered.length ? (
        <div className="empty-state">
          <p>{posts.length ? "No posts match your filters." : "No posts yet. Create your first post."}</p>
          {!posts.length && (
            <Link href="/admin/posts/new" className="btn btn-primary">
              + New post
            </Link>
          )}
        </div>
      ) : (
        <div className="posts-table">
          <div className="table-header" style={{ gridTemplateColumns: "1fr 110px 130px 90px 220px" }}>
            <span>Title</span>
            <span>Status</span>
            <span>Updated</span>
            <span style={{ textAlign: "right" }}>Views</span>
            <span style={{ textAlign: "right" }}>Actions</span>
          </div>
          {filtered.map((post) => (
            <div key={post.id} className="table-row" style={{ gridTemplateColumns: "1fr 110px 130px 90px 220px" }}>
              <span style={{ minWidth: 0 }}>
                <span className="post-title" title={post.title}>{post.title || "Untitled"}</span>
                <br />
                <span style={{ fontSize: "12px", color: "var(--muted)", fontFamily: "monospace" }}>
                  /blog/{post.slug || "—"}
                </span>
              </span>
              <span><StatusBadge status={post.status} /></span>
              <span className="post-date" title={formatDateTime(post.updatedAt)}>{formatDate(post.updatedAt)}</span>
              <span className="post-date" style={{ textAlign: "right" }}>{(post.views || 0).toLocaleString()}</span>
              <div className="post-actions">
                <Link href={`/admin/posts/${post.id}`} className="btn btn-secondary" style={{ height: "32px", padding: "0 14px" }}>
                  Edit
                </Link>
                {post.status === "PUBLISHED" && post.slug && (
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ height: "32px", padding: "0 14px" }}>
                    View
                  </a>
                )}
                <button
                  type="button"
                  className="btn btn-ghost"
                  style={{ height: "32px", padding: "0 14px", color: "#ef4444" }}
                  disabled={deletingId === post.id}
                  onClick={() => handleDelete(post.id, post.title)}
                >
                  {deletingId === post.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("../../lib/auth");
  const { prisma } = await import("../../lib/db");
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  let authorId = session.user?.id;
  if (!authorId && session.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    authorId = user?.id;
  }

  const rows = authorId
    ? await prisma.post.findMany({
        where: { authorId },
        include: { tags: { select: { id: true, slug: true, name: true } } },
        orderBy: { updatedAt: "desc" },
      })
    : [];

  const posts = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    status: p.status,
    views: p.views,
    coverImage: p.coverImage,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    tags: p.tags,
  }));

  return {
    props: {
      session,
      posts,
    },
  };
}
