import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import { SIGNATURE_SVG } from "../../data/signature";

export default function BlogListing({ posts: initialPosts }) {
  const [liveViews, setLiveViews] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("post-views") || "{}");
    } catch {
      return {};
    }
  });

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      initialPosts.map((p) =>
        fetch(`/api/views/${p.slug}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => (d && typeof d.views === "number" ? [p.slug, d.views] : null))
          .catch(() => null)
      )
    ).then((entries) => {
      if (cancelled) return;
      const map = {};
      for (const e of entries) if (e) map[e[0]] = e[1];
      setLiveViews((prev) => {
        const next = { ...prev, ...map };
        try {
          sessionStorage.setItem("post-views", JSON.stringify(next));
        } catch {}
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [initialPosts]);
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
            {initialPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="blog-list-item">
                <span className="blog-card-date">{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : ""}</span>
                <span className="blog-item-title">{post.title}</span>
                <span className="blog-card-time">{(liveViews[post.slug] ?? post.views).toLocaleString()} views</span>
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

export async function getStaticProps() {
  const { prisma } = await import("../../lib/db");
  const now = new Date();
  const rows = await prisma.post.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: now } },
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
