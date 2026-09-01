import Clock from "./Clock";

const emailArrow = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 4.50098H5.5C3.61438 4.50098 2.67157 4.50098 2.08578 5.08675C1.5 5.67255 1.5 6.61535 1.5 8.501V10.001" stroke="#5D5D5D" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 2.00098L9.5 4.501L7 7.001" stroke="#5D5D5D" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export default function Hero({ avatarSrc, signatureSvg }) {
  return (
    <header className="hero">
      <div className="hero-head">
        <div className="identity">
          <div className="avatar-wrap">
            <img className="avatar-full" src={avatarSrc} alt="" />
          </div>
          <div
            className="signature"
            id="sigHero"
            dangerouslySetInnerHTML={{ __html: signatureSvg }}
          />
        </div>

        <div className="hero-meta">
          <Clock />
          <a className="email" href="mailto:ilesanmierioluwavictor@gmail.com">
            <span className="txt">ilesanmierioluwavictor@gmail.com</span>
            <span dangerouslySetInnerHTML={{ __html: emailArrow }} />
          </a>
        </div>
      </div>

      <p className="lede txt">
        Frontend Engineer and product builder focused on creating scalable,
        user-centered digital products. I specialize in React, Next.js, and
        TypeScript, combining engineering, product thinking, and human-centered
        design to turn ideas into useful experiences.
      </p>

      <p className="sub txt">
        I build modular, documented components end-to-end, integrate RESTful
        APIs and real-time WebSocket events, and work with PostgreSQL, MySQL,
        and MongoDB-backed services. Comfortable with authentication flows, code
        reviews, and deploying to AWS (EC2/RDS) with CI/CD pipelines (GitHub
        Actions).
      </p>

      <p className="clients txt">
        I&rsquo;ve worked with:{" "}
        <span className="clients-logos">
          <span className="client-item"><img src="/images/AbS.png" alt="AbS Technologies" className="client-logo" />AbS Technologies</span>
          <span className="client-item"><img src="/images/Digiyo.png" alt="DigiYo" className="client-logo" />DigiYo</span>
          <span className="client-item"><img src="/images/HelloBob.png" alt="HelloBob" className="client-logo" />HelloBob</span>
          and more.
        </span>
      </p>

      <a
        className="cta"
        role="button"
        tabIndex={0}
        data-cal-link="ilesanmi-erioluwa-victor"
        data-cal-namespace="ilesanmi-erioluwa-victor"
        data-cal-config='{"layout":"month_view","useSlotsViewOnSmallScreen":"true"}'
      >
        <span className="txt">Book a Call</span>
        <svg
          width="11"
          height="7"
          viewBox="0 0 11 7"
          fill="none"
          aria-hidden="true"
        >
          <line
            x1="3.5"
            y1="3.5"
            x2="7.5"
            y2="3.5"
            stroke="#2ECC71"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>
      </a>
    </header>
  );
}
