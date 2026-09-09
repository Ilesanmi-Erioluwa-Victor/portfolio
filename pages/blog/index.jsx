import Head from "next/head";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { SIGNATURE_SVG } from "../../data/signature";

export default function BlogListing({ posts }) {
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
            {posts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-list-item">
                <span className="blog-card-date">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
                <span className="blog-item-title">{post.title}</span>
                <span className="blog-card-time">{post.views.toLocaleString()} views</span>
              </Link>
            ))}
          </div>
        </div>

        <Footer signatureSvg={SIGNATURE_SVG} dedupe />
      </div>
    </>
  );
}

export async function getStaticProps() {
  const { prisma } = await import("../../lib/db");
  const rows = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      excerpt: true,
      views: true,
      publishedAt: true,
      updatedAt: true,
      tags: { select: { slug: true, name: true } },
    },
  });

  const posts = rows.map((p) => ({
    ...p,
    publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
  }));

  return {
    props: { posts },
    revalidate: 60,
  };
}
