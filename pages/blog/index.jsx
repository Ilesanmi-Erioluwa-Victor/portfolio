import Head from "next/head";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { prisma } from "../../lib/db";
import { SIGNATURE_SVG } from "../../data/signature";

export default async function BlogListing() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      date: true,
      excerpt: true,
      readTime: true,
      tags: true,
    },
  });

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
                <span className="blog-card-date">{post.date}</span>
                <span className="blog-item-title">{post.title}</span>
                <span className="blog-card-time">{post.readTime}</span>
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
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      slug: true,
      title: true,
      date: true,
      excerpt: true,
      readTime: true,
      tags: true,
    },
  });

  return {
    props: { posts },
    revalidate: 60,
  };
}

export default function BlogListing() {
  // This is just for TypeScript - actual component is the async one above
  return null;
}
