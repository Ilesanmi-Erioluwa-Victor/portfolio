import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      document.body.classList.remove("loading", "revealed", "settled");
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => router.events.off("routeChangeStart", handleRouteChange);
  }, [router]);

  return (
    <>
      <Head>
        <title>Ilesanmi Erioluwa Victor — Full Stack Developer</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ededed" />
        <meta
          name="description"
          content="Ilesanmi Erioluwa Victor is a Full Stack Developer in Lagos, specializing in React, Node.js, and fintech platforms."
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://ilesanmi.vercel.app/" />
        <link rel="icon" href="/favicon.jpeg" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Ilesanmi Erioluwa Victor" />
        <meta property="og:url" content="https://ilesanmi.vercel.app/" />
        <meta property="og:title" content="Ilesanmi Erioluwa Victor - Full Stack Developer" />
        <meta
          property="og:description"
          content="Full Stack Developer in Lagos, specializing in React, Node.js, and fintech platforms."
        />
        <meta property="og:image" content="https://ilesanmi.vercel.app/og.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Ilesanmi Erioluwa Victor — Full Stack Developer" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@ilesanmiEri" />
        <meta name="twitter:creator" content="@ilesanmiEri" />
        <meta name="twitter:title" content="Ilesanmi Erioluwa Victor - Full Stack Developer" />
        <meta
          name="twitter:description"
          content="Full Stack Developer in Lagos, specializing in React, Node.js, and fintech platforms."
        />
        <meta name="twitter:image" content="https://ilesanmi.vercel.app/og.jpg" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}