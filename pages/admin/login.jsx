import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function Login({ adminEmail }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const router = useRouter();
  const { from } = router.query;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    const result = await signIn("email", { email, callbackUrl: from || "/admin/posts" });
    if (result?.ok) {
      setStatus("sent");
    } else {
      setStatus("error");
    }
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="currentColor"/>
                <path d="M8 16L14 22L24 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="login-title">Sign in to admin</h1>
            <p className="login-subtitle">Enter your email to receive a magic link</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className="form-field">
              <label htmlFor="email" className="form-label">Email</label>
              <div className="form-input-wrapper">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  disabled={status === "loading"}
                  className="form-input"
                  placeholder="you@example.com"
                  aria-describedby={status === "error" ? "email-error" : undefined}
                />
              </div>
              {status === "error" && (
                <p id="email-error" className="form-error" role="alert">
                  Failed to send magic link. Please try again.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={status === "loading" || status === "sent"}
              className="login-btn"
              aria-busy={status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <span className="btn-spinner" aria-hidden="true"></span>
                  <span>Sending…</span>
                </>
              ) : status === "sent" ? (
                "Magic link sent"
              ) : (
                "Send magic link"
              )}
            </button>
          </form>

          {status === "sent" && (
            <div className="login-success" role="status">
              <svg className="success-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="10" fill="currentColor"/>
                <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p>Check your email for the magic link.</p>
              <p className="success-hint">The link expires in 24 hours.</p>
            </div>
          )}

          <p className="login-footer">
            Only <span className="login-admin-email">{adminEmail}</span> can sign in.
          </p>
        </div>
      </main>
    </div>
  );
}

export async function getServerSideProps() {
  return {
    props: {
      adminEmail: process.env.ADMIN_EMAIL,
    },
  };
}