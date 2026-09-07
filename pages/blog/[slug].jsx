import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export default async function BlogPost({ params }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { author: true, tags: true },
  });

  if (!post) {
    return { notFound: true };
  }

  return (
    <>
      <Seo
        path={`/blog/${post.slug}`}
        title={post.title}
        description={post.excerpt}
        ogImage={`https://${process.env.AWS_CLOUDFRONT_DOMAIN}/api/og?title=${encodeURIComponent(post.title)}&tags=${post.tags.map(t => t.slug).join(",")}`}
        ogType="article"
        publishedTime={new Date(post.publishedAt).toISOString()}
        modifiedTime={new Date(post.updatedAt).toISOString()}
        author="Ilesanmi Erioluwa Victor"
        tags={post.tags.map(t => t.slug)}
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
              <span className="blog-card-date">{new Date(post.publishedAt).toLocaleDateString()}</span>
              <span className="blog-card-time">{post.views.toLocaleString()} views</span>
              <div className="blog-card-tags">
                {post.tags.map((tag) => (
                  <span key={tag.slug} className="blog-card-tag">{tag.name}</span>
                ))}
              </div>
            </div>
          </div>

          <article className="blog-post-content" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />

          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  var slug = "${post.slug}";
                  var ip = null;
                  var url = "/api/views/" + slug;
                  fetch(url, { method: "POST" })
                    .then(function(res) { return res.json(); })
                    .then(function(data) {
                      if (data.views) {
                        var el = document.querySelector("[data-views]");
                        if (el) el.textContent = data.views.toLocaleString() + " views";
                      }
                    })
                    .catch(function() {});
                })();
              `,
            }}
          />
        </article>
      </div>

      <Footer signatureSvg={SIGNATURE_SVG} dedupe />
    </>
  );
}

export async function getStaticPaths() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return {
    paths: posts.map((p) => ({ params: { slug: p.slug } })),
    fallback: "blocking",
  };
}

export async function getStaticProps({ params }) {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    include: { author: true, tags: true },
  });
  if (!post || post.status !== "PUBLISHED") return { notFound: true };
  return { props: { post }, revalidate: 60 };
}

  if (!post) {
    return (
      <div className="blog-page">
        <Nav />
        <div className="col" style={{ paddingTop: "100px", textAlign: "center" }}>
          <h1>Post not found</h1>
          <Link href="/blog" className="blog-back">← Back to blog</Link>
        </div>
      </div>
    );
  }
  const words = wordCount(post.content);
  const minutes = readingMinutes(post.content);
  const updatedISO = post.updatedAt
    ? new Date(post.updatedAt).toISOString()
    : new Date(post.date).toISOString();
  const postUrl = `https://ilesanmi.vercel.app/blog/${post.slug}`;
  const ogImage = `/api/og?title=${encodeURIComponent(post.title)}&tags=${encodeURIComponent(post.tags.join(","))}`;

  return (
    <>
      <Seo
        path={`/blog/${post.slug}`}
        title={post.title}
        description={post.excerpt}
        ogType="article"
        ogImage={ogImage}
        publishedTime={new Date(post.date).toISOString()}
        modifiedTime={updatedISO}
        author="Ilesanmi Erioluwa Victor"
        tags={post.tags}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: `https://ilesanmi.vercel.app${ogImage}`,
          datePublished: new Date(post.date).toISOString(),
          dateModified: updatedISO,
          author: {
            "@type": "Person",
            name: "Ilesanmi Erioluwa Victor",
            url: "https://ilesanmi.vercel.app/",
          },
          publisher: {
            "@type": "Person",
            name: "Ilesanmi Erioluwa Victor",
          },
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": postUrl,
          },
          keywords: post.tags.join(", "),
          wordCount: words,
          timeRequired: `PT${minutes}M`,
          url: postUrl,
        }}
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
              <span className="blog-card-date">{post.date}</span>
              <span className="blog-card-time">{minutes} min read · {words} words</span>
              <div className="blog-card-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="blog-card-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <article className="blog-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <section className="outro">
          <Footer signatureSvg={SIGNATURE_SVG} dedupe />
        </section>
      </div>
    </>
  );
}

export async function getStaticPaths() {
  return {
    paths: POSTS.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = getPost(params.slug);
  if (!post) return { notFound: true };
  return { props: { post } };
}
