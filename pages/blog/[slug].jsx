import { useEffect } from "react";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import Seo from "../../components/Seo";
import { SIGNATURE_SVG } from "../../data/signature";

export default function BlogPost({ post }) {
  useEffect(() => {
    if (!post) return;
    fetch(`/api/views/${post.slug}`, { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data.views) {
          const el = document.querySelector("[data-views]");
          if (el) el.textContent = `${data.views.toLocaleString()} views`;
        }
      })
      .catch(() => {});
  }, [post]);

  if (!post) {
    return (
      <div className="blog-page">
        <Nav />
        <div className="col" style={{ paddingTop: "100px", textAlign: "center" }}>
          <h1>Post not found</h1>
          <Link href="/blog" className="blog-back">Back to blog</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Seo
        path={`/blog/${post.slug}`}
        title={post.title}
        description={post.excerpt}
        ogImage={`/api/og?title=${encodeURIComponent(post.title)}&desc=${encodeURIComponent((post.excerpt || "").slice(0, 160))}&tags=${post.tags.map((t) => t.slug).join(",")}`}
        ogType="article"
        publishedTime={post.publishedAt}
        modifiedTime={post.updatedAt}
        author="Ilesanmi Erioluwa Victor"
        tags={post.tags.map((t) => t.name)}
      />

      <div className="blog-page">
        <Nav />

        <div className="col">
          <div className="blog-post-header">
            <Link href="/blog" className="blog-back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10.5 3.5L5.5 8L10.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to blog
            </Link>
            <h1 className="blog-post-title">{post.title}</h1>
            <div className="blog-post-meta">
              <span className="blog-card-date">
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}
              </span>
              <span className="blog-card-time" data-views>{post.views.toLocaleString()} views</span>
              <div className="blog-card-tags">
                {post.tags.map((tag) => (
                  <Link key={tag.slug} href={`/blog/tag/${tag.slug}`} className="blog-card-tag">{tag.name}</Link>
                ))}
              </div>
            </div>
          </div>

          <article className="blog-post-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </div>

        <Footer signatureSvg={SIGNATURE_SVG} dedupe />
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const { prisma } = await import("../../lib/db");
  const now = new Date();
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: now } },
    select: { slug: true },
  });
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const { prisma } = await import("../../lib/db");
  const row = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { tags: { select: { slug: true, name: true } } },
  });
  if (!row || row.status !== "PUBLISHED") return { notFound: true };
  if (row.publishedAt && new Date(row.publishedAt) > new Date()) return { notFound: true };

  const post = {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    contentHtml: row.contentHtml,
    views: row.views,
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
    tags: row.tags,
  };

  return { props: { post }, revalidate: 60 };
}
