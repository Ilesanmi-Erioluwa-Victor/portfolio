import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import Seo from "../../components/Seo";
import { POSTS } from "../../data/posts";
import { SIGNATURE_SVG } from "../../data/signature";

export default function BlogListing() {
  return (
    <>
      <Seo
        path="/blog"
        title="Blog"
        description="Articles on React, Node.js, DevOps, and full-stack development by Ilesanmi Erioluwa Victor."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Ilesanmi Erioluwa Victor — Blog",
          url: "https://ilesanmi.vercel.app/blog",
          author: {
            "@type": "Person",
            name: "Ilesanmi Erioluwa Victor",
          },
        }}
      />

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
            {POSTS.map((post) => (
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
