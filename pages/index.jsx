import Head from "next/head";
import Loader from "../components/Loader";
import Nav from "../components/Nav";
import Hero from "../components/Hero";
import RecentBlog from "../components/RecentBlog";
import WorksGrid from "../components/WorksGrid";
import Process from "../components/Process";
import Footer from "../components/Footer";
import FloatingNav from "../components/FloatingNav";
import { SIGNATURE_SVG } from "../data/signature";


const signatureSvg = SIGNATURE_SVG;

export default function Home() {
  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ilesanmi Erioluwa Victor",
  "url": "https://ilesanmi.vercel.app/",
  "image": "https://ilesanmi.vercel.app/og.jpg",
  "jobTitle": "Full Stack Developer",
  "email": "mailto:ilesanmierioluwavictor@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Lagos",
    "addressCountry": "NG"
  },
  "sameAs": [
    "https://x.com/ilesanmiEri",
    "https://www.linkedin.com/in/ilesanmi-erioluwa-victor",
    "https://www.instagram.com/ilesanmierioluwa/",
    "https://github.com/ilesanmierioluwa"
  ]
}`,
          }}
        />
      </Head>

      <Loader />

      <div className="page" id="top">
        <Nav />

        <div className="col">
          <Hero signatureSvg={signatureSvg} />
        </div>

        <RecentBlog />

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
