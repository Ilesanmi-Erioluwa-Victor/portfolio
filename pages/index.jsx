import Loader from "../components/Loader";
import Nav from "../components/Nav";
import Hero from "../components/Hero";
import RecentBlog from "../components/RecentBlog";
import WorksGrid from "../components/WorksGrid";
import Process from "../components/Process";
import Footer from "../components/Footer";
import FloatingNav from "../components/FloatingNav";
import Seo from "../components/Seo";
import { SIGNATURE_SVG } from "../data/signature";

const signatureSvg = SIGNATURE_SVG;

export default function Home({ recentPosts = [] }) {
  return (
    <>
      <Seo
        path="/"
        title={null}
        description="Ilesanmi Erioluwa Victor is a Full Stack Developer in Lagos, specializing in React, Next.js, Node.js, and fintech platforms. View selected work, recent writing, and how to get in touch."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: "Ilesanmi Erioluwa Victor",
          url: "https://ilesanmi.vercel.app/",
          image: "https://ilesanmi.vercel.app/og.jpg",
          jobTitle: "Full Stack Developer",
          email: "mailto:ilesanmierioluwavictor@gmail.com",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Lagos",
            addressCountry: "NG",
          },
          sameAs: [
            "https://x.com/ilesanmiEri",
            "https://www.linkedin.com/in/ilesanmi-erioluwa-victor",
            "https://www.instagram.com/ilesanmierioluwa/",
            "https://github.com/ilesanmierioluwa",
          ],
        }}
      />

      <Loader />

      <div className="page" id="top">
        <Nav />

        <div className="col">
          <Hero signatureSvg={signatureSvg} />
        </div>

        <RecentBlog posts={recentPosts} />

        <WorksGrid />

        <section className="outro">
          <Process />
          <Footer signatureSvg={signatureSvg} dedupe />
        </section>
      </div>

      <FloatingNav />
    </>
  );
}

export async function getStaticProps() {
  const { prisma } = await import("../lib/db");
  const now = new Date();
  const rows = await prisma.post.findMany({
    where: { status: "PUBLISHED", publishedAt: { lte: now } },
    orderBy: { publishedAt: "desc" },
    take: 3,
    select: {
      slug: true,
      title: true,
      excerpt: true,
      views: true,
      publishedAt: true,
      tags: { select: { slug: true, name: true } },
    },
  });

  return {
    props: {
      recentPosts: rows.map((p) => ({
        ...p,
        publishedAt: p.publishedAt ? p.publishedAt.toISOString() : null,
      })),
    },
    revalidate: 60,
  };
}
