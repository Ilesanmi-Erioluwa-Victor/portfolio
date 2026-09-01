"use client";
import Link from "next/link";

const RECENT_POSTS = [
  {
    slug: "building-scalable-react-apps",
    title: "Building Scalable React Applications",
    date: "2025-12-15",
    excerpt: "Lessons learned from architecting React frontends that serve thousands of users. From component composition to state management patterns that scale.",
    tags: ["React", "Architecture"],
    readTime: "8 min read",
  },
  {
    slug: "real-time-features-with-websockets",
    title: "Real-time Features with WebSockets in Node.js",
    date: "2025-11-02",
    excerpt: "How to implement live chat, notifications, and collaborative features using WebSocket events in a production Node.js backend.",
    tags: ["Node.js", "WebSockets"],
    readTime: "6 min read",
  },
  {
    slug: "ci-cd-pipelines-for-startups",
    title: "CI/CD Pipelines That Actually Work for Startups",
    date: "2025-09-20",
    excerpt: "A practical guide to setting up GitHub Actions for automated testing, building, and deploying to AWS EC2/RDS without over-engineering.",
    tags: ["DevOps", "AWS"],
    readTime: "5 min read",
  },
];

export default function RecentBlog() {
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
        {RECENT_POSTS.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-card">
            <div className="blog-card-top">
              <span className="blog-card-date">{post.date}</span>
              <span className="blog-card-time">{post.readTime}</span>
            </div>
            <h3 className="blog-card-title">{post.title}</h3>
            <p className="blog-card-excerpt">{post.excerpt}</p>
            <div className="blog-card-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="blog-card-tag">{tag}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}