import Head from "next/head";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { SIGNATURE_SVG } from "../../data/signature";

const ALL_POSTS = [
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

export default function BlogListing() {
  return (
    <>
      <Head>
        <title>Blog — Ilesanmi Erioluwa Victor</title>
        <meta name="description" content="Articles on React, Node.js, DevOps, and full-stack development by Ilesanmi Erioluwa Victor." />
      </Head>

      <div className="blog-page">
        <Nav />

        <div className="col">
          <div className="blog-header">
            <Link href="/" className="blog-back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10.5 3.5L5.5 8L10.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back
            </Link>
            <h1 className="blog-page-title">Blog</h1>
            <p className="blog-page-sub">Thoughts on full-stack development, tools, and practices.</p>
          </div>

          <div className="blog-list">
            {ALL_POSTS.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-list-item">
                <span className="blog-card-date">{post.date}</span>
                <span className="blog-item-title">{post.title}</span>
                <span className="blog-card-time">{post.readTime}</span>
              </Link>
            ))}
          </div>
        </div>

        <section className="outro">
          <Footer signatureSvg={SIGNATURE_SVG} dedupe />
        </section>
      </div>
    </>
  );
}