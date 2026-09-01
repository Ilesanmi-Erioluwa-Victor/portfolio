import Head from "next/head";
import Script from "next/script";
import Loader from "../components/Loader";
import Nav from "../components/Nav";
import Hero from "../components/Hero";
import RecentBlog from "../components/RecentBlog";
import WorksGrid from "../components/WorksGrid";
import Process from "../components/Process";
import Footer from "../components/Footer";
import FloatingNav from "../components/FloatingNav";

const avatarBase64 =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAzNiA0MSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+PHJlY3Qgd2lkdGg9IjM2IiBoZWlnaHQ9IjM2IiByeD0iOCIgZmlsbD0idXJsKCNhdmF0YXJQYXQpIi8+PHBhdGggZD0iTTggNDBIMjgiIHN0cm9rZT0iIzJFQ0M3MSIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIvPjxkZWZzPjxwYXR0ZXJuIGlkPSJhdmF0YXJQYXQiIHBhdHRlcm5Db250ZW50VW5pdHM9Im9iamVjdEJvdW5kaW5nQm94IiB3aWR0aD0iMSIgaGVpZ2h0PSIxIj48dXNlIHhsaW5rOmhyZWY9IiNhdmF0YXJJbWciIHRyYW5zZm9ybT0ic2NhbGUoMC4wMDY5NDQ0NCkiLz48L3BhdHRlcm4+PGltYWdlIGlkPSJhdmF0YXJJbWciIHdpZHRoPSIxNDQiIGhlaWdodD0iMTQ0IiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPSJub25lIiB4bGluazpocmVmPSJkYXRhOmltYWdlL2pwZWc7YmFzZTY0LC85ai80QUFRU2taSlJnQUJBUUFBQVFBQkFBRC8yd0JEQUFRREF3UURBd1FFQkFRRkJRUUZCd3NIQndZR0J3NEtDZ2dMRUE0UkVSQU9FQThTRkJvV0VoTVlFdzhRRmg4WEdCc2JIUjBkRVJZZ0loOGNJaG9jSFJ6LzJ3QkRBUVVGQlFjR0J3MEhCdzBjRWhBU0hCd2NIQndjSEJ3Y0hCd2NIQndjSEJ3Y0hCd2NIQndjSEJ3Y0hCd2NIQndjSEJ3Y0hCd2NIQndjSEJ3Y0hCd2NIQnovd0FBUkNBQ1FBSkFEQVNJQUFoRUJBeEVCLzhRQUhRQUFBUVFEQVFFQUFBQUFBQUFBQUFBQUF3SUVCUVlCQndnSkFQL0VBRUVRQUFFREF3SUVBd1FIQlFVSkFBQUFBQUVDQXdRQUJSRVNJUVlUTVVFSFVXRWlNbkdCQ0JSQ1lwR2hzUlVqTTBQQkZuS0NzOUVsTkVSU1pIT1N3dEwveEFBYUFRQUNBd0VCQUFBQUFBQUFBQUFBQUFBQkF3QUVCUUlHLzhRQUxSRUFBZ0VEQXdJRkF3UURBQUFBQUFBQUFBRUNBd1FSQlJJaE1WRUdFeUpCWVhHaDhCUXp3ZUVWTkVMLzJnQU1Bd0VBQWhFREVRQS9BTzMxcWpCU1U4NUJVdklTQ2NFNDY5YXd1TWxXY0VINGIxd3BONC91dHJXdHROd3VDWG1Uclh6VkhaT25CUmpmZnI4dmhUcTJlTDNFVmduSURkNGVkVG9Uam5uS2QraHdlbTJOalZYYyt4ZTJZOXp0VjZIdGtVeGNqRWRxMUR3RDQvUkw1SVJCdkQ3RVo1U2ZZY0N3RXJWMXdUbkc0SXhXMWJUeE5hci9BSi9aODVtUXJmMkVxOW9ZeG5iNTB0eVh1SGF6QzJNZHFiT05IQkI2Vk5xYlNyclRkeUhxR1VtdU1vNjVLMUt0VU9WL0dpc3JQcWdacUxmNFF0Ym00WlcyZnVMTlcxMkc0RHNuUHdwcXRwYVR1a2o1VkNGTmU0TGpmeTVMeVA3d0NxajNlRHBRSkRVaGxZKzhDazFmRm9Cb2ZMQU9hQVRYRDNDOXpaLzRZT0Q3aWdhakg3WEthSjVrUjVPUE5CcmJKVG1ra1k3MUNHbTFSMEhPUmcrdEJWRFJuNDF1TjJLeThNT010ckgza2cwd2U0ZnRyL3Z3MnZpbmI5S21TWU5TcnR6U3gwR2FicnQ2bS80YnEwL0JWYlVkNE10am51YzVzL2RWbi9ham4rQkVIOEZGVVBSYVA5S200R0RYWE11TEJCYmxMMjh6UjIrSUx4R1A4US9BRHMrbjBQaHdLQUFBPT0iLz48L2RlZnM+PC9zdmc+";

const signatureSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 32" fill="none" role="img" aria-label="ilesanmi">
  <defs>
    <mask id="ink-reveal" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="32">
      <path id="ink-path" class="sig-path" d="M0 8C8 8 14 8 18 8C22 8 24 8 26 8" 
        fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" 
        pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
      <path id="ink-path-l" class="sig-path" d="M28 8C26 10 24 15 24 20C24 24 24 28 26 28C28 28 30 28 32 26"
        fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
        pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
      <path id="ink-path-es" class="sig-path" d="M34 20C36 15 38 8 40 8C44 8 48 12 48 16C48 18 46 20 44 20C42 20 40 18 40 16C38 10 42 8 46 8C50 8 54 12 54 16C54 16 54 20 54 24C54 26 52 28 50 28"
        fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
        pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
      <path id="ink-path-a" class="sig-path" d="M54 28C56 24 58 16 58 14C58 10 60 8 62 8C66 8 68 12 68 16C68 18 66 20 64 20C62 20 60 18 60 16C58 10 62 8 66 8C70 8 74 12 74 16C74 18 74 22 72 26"
        fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
        pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
      <path id="ink-path-n" class="sig-path" d="M74 28C76 20 78 8 78 8C78 8 80 14 82 20C84 24 86 26 86 26C86 26 88 22 90 16C92 10 94 8 94 8"
        fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
        pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
      <path id="ink-path-mi" class="sig-path" d="M96 8C96 12 96 18 96 22C96 26 98 28 100 28C104 28 108 24 108 20C108 18 106 16 104 16C102 16 100 18 100 20C100 22 102 24 104 24C108 24 112 20 114 16C116 12 116 8 114 6"
        fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
        pathLength="1000" stroke-dasharray="1000 1000" stroke-dashoffset="1000"/>
    </mask>
  </defs>
  <g mask="url(#ink-reveal)">
    <text x="0" y="22" font-family="Georgia, serif" font-size="14" font-style="italic" fill="#5D5D5D">ilesanmi</text>
  </g>
</svg>`;

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

      <Script
        id="cal-embed"
        strategy="afterInteractive"
      >{`(function(C,A,L){let p=function(a,ar){a.q.push(ar);};let d=C.document;C.Cal=C.Cal||function(){let cal=C.Cal;let ar=arguments;if(!cal.loaded){cal.ns={};cal.q=cal.q||[];d.head.appendChild(d.createElement("script")).src=A;cal.loaded=true;}if(ar[0]===L){const api=function(){p(api,arguments);};const namespace=ar[1];api.q=api.q||[];if(typeof namespace==="string"){cal.ns[namespace]=cal.ns[namespace]||api;p(cal.ns[namespace],ar);p(cal,["initNamespace",namespace]);}else p(cal,ar);return;}p(cal,ar);};})(window,"https://app.cal.com/embed/embed.js","init");
Cal("init","ilesanmi-erioluwa-victor",{origin:"https://cal.com"});
Cal.config=Cal.config||{};
Cal.config.forwardQueryParams=true;
Cal.ns["ilesanmi-erioluwa-victor"]("ui",{"hideEventTypeDetails":false,"layout":"month_view"});`}</Script>
    </>
  );
}
