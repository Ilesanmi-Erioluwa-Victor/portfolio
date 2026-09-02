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

const avatarBase64 =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAzNiA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0idXJsKCNhdmF0YXJQYXQpIi8+PHBhdGggZD0iTTggNDBIMjgiIHN0cm9rZT0iIzJFQ0M3MSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxkZWZzPjxwYXR0ZXJuIGlkPSJhdmF0YXJQYXQiIHBhdHRlcm5Db250ZW50VW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48dXNlIHhsaW5rOmhyZWY9IiNhdmF0YXJJbWciIHRyYW5zZm9ybT0ic2NhbGUoMC4wMDY5NDQ0NCkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhdmF0YXJJbWciIHdpZHRoPSIxNDQiIGhlaWdodD0iMTQ0IiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB4bGluazpocmVmPSJkYXRhOmltYWdlL2pwZWc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQUFRREF3UURBd1FFQkFRRkJRUUZCd3NIQndZR0J3NEtDZ2dMRUE0UkVSQU9FQThTRkJvV0VoTVlFdzhRRmg4WEdCc2JIUjBkRVJZZ0loOGNJaG9jSFJ6LzJ3QkRBUVVGQlFjR0J3MEhCdzBjRWhBU0hCd2NIQndjSEJ3Y0hCd2NIQndjSEJ3Y0hCd2NIQndjSEJ3Y0hCd2NIQndjSEJ3Y0hCd2NIQndjSEJ3Y0hCd2NIQnovd0FBUkNBQ1FBSkFEQVNJQUFoRUJBeEVCLzhRQUhRQUFBUVFEQVFFQUFBQUFBQUFBQUFBQUF3SUVCUVlCQndnSkFQL0VBRUVRQUFFREF3SUVBd1FIQlFVSkFBQUFBQUVDQXdRQUJSRVNJUVlUTVVFSFVXRWlNbkdCQ0JSQ1lwR2hzUlVqTTBQQkZuS0NzOUVsTkVSU1pIT1N3dEwveEFBYUFRQUNBd0VCQUFBQUFBQUFBQUFBQUFBQkF3QUVCUUlHLzhRQUxSRUFBZ0VEQXdJRkF3UURBQUFBQUFBQUFBRUNBd1FSQlJJaE1WRUdFeUpCWVhHaDhCUXp3ZUVWTkVMLzJnQU1Bd0VBQWhFREVRQS9BTzMxcWpCU1U4NUJVdklTQ2NFNDY5YXd1TWxXY0VINGIxd3BONC91dHJXdHROd3VDWG1Uclh6VkhaT25CUmpmZnI4dmhUcTJlTDNFVmduSURkNGVkVG9Uam5uS2QraHdlbTJOalZYYyt4ZTJZOXp0VjZIdGtVeGNqRWRxMUR3RDQvUkw1SVJCdkQ3RVo1U2ZZY0N3RXJWMXdUbkc0SXhXMWJUeE5hci9BSi9aODVtUXJmMkVxOW9ZeG5iNTB0eVh1SGF6QzJNZHFiT05IQkI2Vk5xYlNyclRkeUhxR1VtdU1vNjVLMUt0VU9WL0dpc3JQcWdacUxmNFF0Ym00WlcyZnVMTlcxMkc0RHNuUHdwcXRwYVR1a2o1VkNGTmU0TGpmeTVMeVA3d0NxajNlRHBRSkRVaGxZKzhDazFmRm9Cb2ZMQU9hQVRYRDNDOXpaLzRZT0Q3aWdhakg3WEthSjVrUjVPUE5CcmJKVG1ra1k3MUNHbTFSMEhPUmcrdEJWRFJuNDF1TjJLeThNT010ckgza2cwd2U0ZnRyL3Z3MnZpbmI5S21TWU5TcnR6U3gwR2FicnQ2bS80YnEwL0JWYlV... (line truncated to 2000 chars)";

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
  "url": "https://portfolio-black-omega-96.vercel.app/",
  "image": "https://portfolio-black-omega-96.vercel.app/og.jpg",
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
          <Hero avatarSrc={avatarBase64} signatureSvg={signatureSvg} />
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
