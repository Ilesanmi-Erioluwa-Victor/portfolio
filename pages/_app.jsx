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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ededed" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.jpeg" />
        <link
          rel="sitemap"
          type="application/xml"
          href="https://ilesanmi.vercel.app/sitemap.xml"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
