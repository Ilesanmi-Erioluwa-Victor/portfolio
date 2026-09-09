import Link from "next/link";

export default function RecentBlog({ posts = [] }) {
  if (!posts.length) return null;

  return (
    <section className="works" style={{ marginBottom: "60px" }}>
      <div className="works-head">
        <span>Recent Blog</span>
        <Link href="/blog" className="works-view-all">
          View all posts
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M4.5 3.32516L8.4577 3.54232L8.6748 7.5M8.25 3.75L3.25 8.75" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>
      <div className="recent-blog-grid">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
            <div className="blog-card-top">
              <span className="blog-card-date">
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
              </span>
              <span className="blog-card-time">{(post.views || 0).toLocaleString()} views</span>
            </div>
            <h3 className="blog-card-title">{post.title}</h3>
            <p className="blog-card-excerpt">{post.excerpt}</p>
            <div className="blog-card-tags">
              {(post.tags || []).map((tag) => (
                <span key={typeof tag === "string" ? tag : tag.slug} className="blog-card-tag">
                  {typeof tag === "string" ? tag : tag.name}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
