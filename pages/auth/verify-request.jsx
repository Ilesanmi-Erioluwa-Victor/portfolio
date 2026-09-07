import { useEffect, useState } from "react";

export default function VerifyRequest({ identifier, url, params }) {
  const [countdown, setCountdown] = useState(24 * 60 * 60);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="verify-request-page">
      <main className="verify-request-main">
        <div className="verify-request-card">
          <div className="verify-request-header">
            <div className="verify-request-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="currentColor"/>
                <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="verify-request-title">Check your email</h1>
            <p className="verify-request-subtitle">
              We've sent a magic link to <strong>{identifier}</strong>
            </p>
          </div>

          <div className="verify-request-info">
            <div className="verify-request-timer" aria-live="polite">
              <span className="timer-label">Link expires in</span>
              <span className="timer-value">{formatTime(countdown)}</span>
            </div>
            <p className="verify-request-hint">
              Didn't receive it? Check your spam folder, or{" "}
              <a href="/admin/login" className="verify-request-link">
                request a new link
              </a>
            </p>
          </div>

          <div className="verify-request-divider" aria-hidden="true">
            <span>or</span>
          </div>

          <a
            href={url}
            className="verify-request-btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
            <span>Open magic link directly</span>
          </a>

          <p className="verify-request-footer">
            This link can only be used once. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { provider, identifier, url, token } = context.query;
  return {
    props: {
      params: { provider, token },
      identifier,
      url,
    },
  };
}