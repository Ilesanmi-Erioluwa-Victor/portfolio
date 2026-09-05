import Head from "next/head";

const SITE_NAME = "Ilesanmi Erioluwa Victor";
const SITE_URL = "https://ilesanmi.vercel.app";
const DEFAULT_DESCRIPTION =
  "Ilesanmi Erioluwa Victor is a Full Stack Developer in Lagos, specializing in React, Node.js, and fintech platforms.";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og.jpg`;

export default function Seo({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  twitterCard = "summary_large_image",
  publishedTime,
  modifiedTime,
  author = SITE_NAME,
  tags = [],
  jsonLd,
  noindex = false,
}) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Full Stack Developer`;
  const canonical = new URL(path, SITE_URL).toString();
  const ogImageAbs = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <link rel="canonical" href={canonical} />
      )}

      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageAbs} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@ilesanmiEri" />
      <meta name="twitter:creator" content="@ilesanmiEri" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageAbs} />

      {ogType === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === "article" && author && (
        <meta property="article:author" content={author} />
      )}
      {ogType === "article" &&
        tags.map((tag) => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
    </Head>
  );
}

export { SITE_URL, SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE };
