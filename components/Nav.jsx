"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

const socialSvgs = {
  github: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" fill="#5D5D5D"/></svg>`,
  x: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 14L7.03227 8.96773M8.96773 7.03227L14 14H10.6667L7.03227 8.96773L2 2H5.33333L8.96773 7.03227ZM14 2L8.96773 7.03227" stroke="#5D5D5D" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  linkedin: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M16 13.7778C16 15.0053 15.0053 16 13.7778 16H2.22222C0.995111 16 0 15.0053 0 13.7778V2.22222C0 0.994667 0.995111 0 2.22222 0H13.7778C15.0053 0 16 0.994667 16 2.22222V13.7778Z" fill="#5D5D5D"/><path d="M2.66667 5.77778H4.88889V13.3333H2.66667V5.77778ZM3.77111 4.88889H3.75867C3.09556 4.88889 2.66667 4.39467 2.66667 3.77733C2.66667 3.14667 3.10889 2.66667 3.784 2.66667C4.46 2.66667 4.87644 3.14667 4.88889 3.77733C4.88889 4.39422 4.46 4.88889 3.77111 4.88889ZM13.3333 13.3333H11.1111V9.28933C11.1111 8.31244 10.5667 7.64578 9.69244 7.64578C9.02533 7.64578 8.66444 8.09556 8.48933 8.53022C8.42533 8.68578 8.44444 9.116 8.44444 9.33333V13.3333H6.22222V5.77778H8.44444V6.94044C8.76489 6.44444 9.26667 5.77778 10.5502 5.77778C12.1404 5.77778 13.3329 6.77778 13.3329 9.01067L13.3333 13.3333Z" fill="white"/></svg>`,
  instagram: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="2" width="12" height="12" rx="3" stroke="#5D5D5D" stroke-width="1.2"/><circle cx="8" cy="8" r="3" stroke="#5D5D5D" stroke-width="1.2"/><circle cx="12.5" cy="3.5" r="0.5" fill="#5D5D5D"/></svg>`,
};

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const router = useRouter();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;
    if (saved === "dark" || (!saved && prefersDark)) {
      setDark(true);
      document.body.classList.add("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      document.body.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeydown = (e) => {
      if (e.key === "Escape") close();
    };
    addEventListener("keydown", onKeydown);
    return () => removeEventListener("keydown", onKeydown);
  }, [close]);

  useEffect(() => {
    const mq = matchMedia("(min-width: 641px)");
    const onChange = (e) => {
      if (e.matches) close();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [close]);

  useEffect(() => {
    if (open) {
      document.body.dataset.nav = "open";
    } else {
      delete document.body.dataset.nav;
    }
    return () => delete document.body.dataset.nav;
  }, [open]);

  const handleNavClick = () => close();

  return (
    <div className="col">
      <nav data-open={String(open)}>
        <button
          className="nav-toggle"
          type="button"
          aria-label={open ? "Close menu" : "Menu"}
          aria-expanded={String(open)}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? (
            <svg
              className="close"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M13.5 4.5L4.50061 13.4994M13.4994 13.5L4.5 4.50064"
                stroke="currentColor"
                strokeWidth="1.125"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              className="menu"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3 6.375H15"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3 11.625H15"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <div className="nav-links" onClick={handleNavClick}>
          <Link className={`txt${router.pathname === "/" ? " current" : ""}`} href="/">
            Home
          </Link>
          <Link className={`txt${router.pathname === "/resume" ? " current" : ""}`} href="/resume">
            Resume
          </Link>
          <Link className={`txt${router.pathname.startsWith("/blog") ? " current" : ""}`} href="/blog">
            Blog
          </Link>
          <a
            className="book"
            role="button"
            tabIndex={0}
            data-cal-link="ilesanmi-erioluwa-victor"
            data-cal-namespace="ilesanmi-erioluwa-victor"
            data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
          >
            <span className="txt link">Book a call</span>
          </a>
        </div>
        <div className="socials">
          <a
            data-social="github"
            aria-label="Ilesanmi on GitHub"
            href="https://github.com/ilesanmierioluwa"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span dangerouslySetInnerHTML={{ __html: socialSvgs.github }} />
          </a>
          <a
            data-social="x"
            aria-label="Ilesanmi on X"
            href="https://x.com/ilesanmiEri"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span dangerouslySetInnerHTML={{ __html: socialSvgs.x }} />
          </a>
          <a
            data-social="linkedin"
            aria-label="Ilesanmi on LinkedIn"
            href="https://linkedin.com/in/ilesanmi-erioluwa-victor"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span dangerouslySetInnerHTML={{ __html: socialSvgs.linkedin }} />
          </a>
          <a
            data-social="instagram"
            aria-label="Ilesanmi on Instagram"
            href="https://instagram.com/ilesanmierioluwa"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span dangerouslySetInnerHTML={{ __html: socialSvgs.instagram }} />
          </a>
          <button
            className="theme-toggle"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            onClick={toggleTheme}
          >
            {dark ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="4" stroke="currentColor" strokeWidth="1.2" />
                <path d="M8 0v2M8 14v2M0 8h2M14 8h2M1.5 1.5l1.4 1.4M13.1 13.1l1.4 1.4M1.5 14.5l1.4-1.4M13.1 2.9l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M14 9.5A6.5 6.5 0 016.5 2 6 6 0 106.5 14 6.5 6.5 0 0014 9.5z" fill="currentColor" />
              </svg>
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}
