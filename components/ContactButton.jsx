"use client";
import { useEffect, useRef, useState } from "react";

const AR_TOKEN = process.env.NEXT_PUBLIC_AUDIENCERELAY_TOKEN || "";
const AR_SUBMIT_URL = `https://audiencerelay.com/api/v1/forms/${encodeURIComponent(AR_TOKEN)}/submissions`;

export default function ContactButton({
  children = "Contact Me",
  variant = "pill",
  className = "",
  ...rest
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (open && dialogRef.current) dialogRef.current.focus();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`contact-btn contact-btn--${variant} ${className}`.trim()}
        onClick={() => setOpen(true)}
        {...rest}
      >
        <span className="txt">{children}</span>
      </button>

      {open && (
        <ContactModal
          dialogRef={dialogRef}
          onClose={() => setOpen(false)}
          token={AR_TOKEN}
          url={AR_SUBMIT_URL}
        />
      )}
    </>
  );
}

function ContactModal({ dialogRef, onClose, token, url }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus("error");
      setError(
        "Contact form is not configured. Set NEXT_PUBLIC_AUDIENCERELAY_TOKEN in .env.local."
      );
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message,
          marketing_consent: false,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${res.status})`);
      }
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setError(err.message || "Something went wrong.");
    }
  };

  return (
    <div
      className="contact-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="contact-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        tabIndex={-1}
      >
        <button
          type="button"
          className="contact-close"
          aria-label="Close"
          onClick={onClose}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </button>

        {status === "sent" ? (
          <div className="contact-success">
            <p className="contact-success-title txt">Thanks — message sent.</p>
            <p className="contact-success-sub txt">I&rsquo;ll reply from ilesanmierioluwavictor@gmail.com shortly.</p>
            <button type="button" className="contact-submit" onClick={onClose}>
              <span className="txt">Close</span>
            </button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={onSubmit}>
            <h2 id="contact-title" className="contact-title txt">Get in touch</h2>
            <p className="contact-sub txt">Send a message and I&rsquo;ll get back to you.</p>

            <label className="contact-field">
              <span className="contact-label txt">Name</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={status === "sending"}
              />
            </label>

            <label className="contact-field">
              <span className="contact-label txt">Email</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "sending"}
              />
            </label>

            <label className="contact-field">
              <span className="contact-label txt">Message</span>
              <textarea
                name="message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={status === "sending"}
              />
            </label>

            {status === "error" && (
              <p className="contact-error txt" role="alert">{error}</p>
            )}

            <button type="submit" className="contact-submit" disabled={status === "sending"}>
              <span className="txt">{status === "sending" ? "Sending…" : "Send message"}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}