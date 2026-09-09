import Link from "next/link";

export default function AdminIndex({ posts, session }) {
  const drafts = posts.filter((p) => p.status === "DRAFT");
  const published = posts.filter((p) => p.status === "PUBLISHED");
  const archived = posts.filter((p) => p.status === "ARCHIVED");

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const StatusBadge = ({ status }) => {
    const variants = {
      DRAFT: "badge-draft",
      PUBLISHED: "badge-published",
      ARCHIVED: "badge-archived",
    };
    return <span className={`badge ${variants[status]}`}>{status}</span>;
  };

  const renderSection = (title, posts, showViewLink = false) => {
    if (!posts.length) return null;
    return (
      <section className="posts-section">
        <h2 className="section-title">{title} ({posts.length})</h2>
        <div className="posts-table">
          <div className="table-header">
            <span>Title</span>
            <span>Updated</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {posts.map((post) => (
            <div key={post.id} className="table-row">
              <span className="post-title">{post.title || "Untitled"}</span>
              <span className="post-date">{formatDate(post.updatedAt)}</span>
              <span><StatusBadge status={post.status} /></span>
              <div className="post-actions">
                <Link href={`/admin/posts/${post.id}`} className="btn btn-secondary">
                  Edit
                </Link>
                {showViewLink && post.slug && (
                  <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                    View
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="admin-index">
      <div className="admin-header">
        <h1>Posts</h1>
        <Link href="/admin/posts/new" className="btn btn-primary">
          + New post
        </Link>
      </div>

      {renderSection("Drafts", drafts)}
      {renderSection("Published", published, true)}
      {renderSection("Archived", archived)}

      {!posts.length && (
        <div className="empty-state">
          <p>No posts yet. Create your first post.</p>
          <Link href="/admin/posts/new" className="btn btn-primary">
            + New post
          </Link>
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
      redirect: { destination: "/admin/login", permanent: false },
    };
  }

  const rows = await prisma.post.findMany({
    where: { authorId: session.user.id },
    include: { tags: true },
    orderBy: { updatedAt: "desc" },
  });

  const posts = rows.map((p) => ({
    ...p,
    createdAt: p.createdAt ? p.createdAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
  }));

  return {
    props: {
      posts,
      session,
    },
  };
}