"use client";
import Script from "next/script";
import { useEffect, useRef } from "react";

const AR_ORIGIN = process.env.NEXT_PUBLIC_AUDIENCERELAY_ORIGIN || "";
const AR_SRC = "https://api.audiencerelay.com/tag/static/js/contact-form.min.js";

export default function ContactButton({
  children = "Contact Me",
  variant = "pill",
  className = "",
  ...rest
}) {
  const btnRef = useRef(null);

  useEffect(() => {
    if (!btnRef.current) return;
    btnRef.current.classList.add("ar-contact-form");
    btnRef.current.setAttribute("data-ar-origin", AR_ORIGIN);
  }, []);

  return (
    <>
      <Script
        id="audiencerelay-contact"
        src={AR_SRC}
        strategy="afterInteractive"
        defer
      />
      <button
        ref={btnRef}
        type="button"
        className={`contact-btn contact-btn--${variant} ${className}`.trim()}
        {...rest}
      >
        <span className="txt">{children}</span>
      </button>
    </>
  );
}