import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";
import Seo from "../../components/Seo";
import { POSTS, getPost, wordCount, readingMinutes, stripHtml } from "../../data/posts";
import { SIGNATURE_SVG } from "../../data/signature";

export default function BlogPost({ post }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="blog-page">
        <Nav />
        <div className="col" style={{ paddingTop: "100px", textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
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
