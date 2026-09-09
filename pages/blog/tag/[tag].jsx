import Head from "next/head";
import Link from "next/link";
import Nav from "../../../components/Nav";
import Footer from "../../../components/Footer";
import { SIGNATURE_SVG } from "../../../data/signature";

export default function TagPage({ tag, posts }) {
  return (
    <>
      <Head>
        <title>{tag ? `${tag.name} posts` : "Tag"} — Ilesanmi Erioluwa Victor</title>
        <meta name="description" content={tag ? `Articles tagged ${tag.name} by Ilesanmi Erioluwa Victor.` : "Blog tag"} />
      </Head>

      <div className="blog-page">
        <Nav />

        <div className="col">
          <div className="blog-header">
            <Link href="/blog" className="blog-back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10.5 3.5L5.5 8L10.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              All posts
            </Link>
            <h1 className="blog-page-title">#{tag?.name}</h1>
            <p className="blog-page-sub">{posts.length} post{posts.length === 1 ? "" : "s"} tagged “{tag?.name}”.</p>
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

          {!posts.length && (
            <p style={{ color: "var(--muted)" }}>No published posts with this tag yet.</p>
          )}
        </div>

        <section className="outro">
          <Footer signatureSvg={SIGNATURE_SVG} dedupe />
        </section>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  const { prisma } = await import("../../../lib/db");
  const tags = await prisma.tag.findMany({ select: { slug: true } });
  return {
    paths: tags.map((t) => ({ params: { tag: t.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const { prisma } = await import("../../../lib/db");
  const tag = await prisma.tag.findUnique({ where: { slug: params.tag } });
  if (!tag) return { notFound: true };

  const now = new Date();
  const rows = await prisma.post.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: now }, tags: { some: { slug: tag.slug } } },
    orderBy: { publishedAt: "desc" },
    select: { slug: true, title: true, views: true, publishedAt: true },
  });

  return {
    props: {
      tag,
      posts: rows.map((p) => ({
        ...p,
        publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      })),
    },
    revalidate: 60,
  };
}
