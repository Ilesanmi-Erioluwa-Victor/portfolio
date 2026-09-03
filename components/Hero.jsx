import Clock from "./Clock";

const emailArrow = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M9 4.50098H5.5C3.61438 4.50098 2.67157 4.50098 2.08578 5.08675C1.5 5.67255 1.5 6.61535 1.5 8.501V10.001" stroke="#5D5D5D" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 2.00098L9.5 4.501L7 7.001" stroke="#5D5D5D" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const downloadArrow = `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M10 6V8.67C10 9.41 9.41 10 8.67 10H3.33C2.59 10 2 9.41 2 8.67V6" stroke="#fcfbfb" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 2V7M6 7L3.5 4.5M6 7L8.5 4.5" stroke="#fcfbfb" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export default function Hero({ signatureSvg }) {
  return (
    <header className="hero">
      <div className="hero-head">
        <div className="identity">
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
        Product Engineer and full-stack developer building customer-facing
        products across education, fintech, and e-commerce. I work across React,
        Next.js, TypeScript, Node.js, and PostgreSQL, combining engineering with
        product thinking to turn real user needs into reliable, useful
        experiences.
      </p>

      <div className="hero-metrics">
        <div className="metric">
          <span className="metric-num">4+</span>
          <span className="metric-label txt">years experience</span>
        </div>

        <div className="metric">
          <span className="metric-num">3</span>
          <span className="metric-label txt">
            production platforms | Education + Fintech
          </span>
        </div>
      </div>

      <p className="sub txt">
        I build modular, documented components end-to-end, integrate RESTful
        APIs and real-time WebSocket events, and work with PostgreSQL, MySQL,
        and MongoDB-backed services. I deploy to AWS (EC2/RDS) with CI/CD
        pipelines and build AI-powered automation systems that generate and
        schedule content autonomously.
      </p>

      <p className="clients txt">
        I&rsquo;ve worked with:{" "}
        <span className="clients-logos">
          <span className="client-item">
            <img
              src="/images/AbS.png"
              alt="AbS Technologies"
              className="client-logo"
            />
            AbS Technologies
          </span>
          <span className="client-item">
            <img
              src="/images/Digiyo.png"
              alt="DigiYo"
              className="client-logo"
            />
            DigiYo
          </span>
          <span className="client-item">
            <img
              src="/images/HelloBob.png"
              alt="HelloBob"
              className="client-logo"
            />
            HelloBob
          </span>
          and more.
        </span>
      </p>

      <a className="hero-resume" href="/Resume.pdf" download>
        <span className="txt">Download resume</span>
        <span dangerouslySetInnerHTML={{ __html: downloadArrow }} />
      </a>

      <div className="tech-stack">
        <span className="tech-stack-label txt">Core stack:</span>
        <div className="tech-stack-items">
          <span className="tech-tag">React</span>
          <span className="tech-tag">Next.js</span>
          <span className="tech-tag">TypeScript</span>
          <span className="tech-tag">Node.js</span>
          <span className="tech-tag">Express</span>
          <span className="tech-tag">PostgreSQL</span>
          <span className="tech-tag">MongoDB</span>
          <span className="tech-tag">MySQL</span>
          <span className="tech-tag">Tailwind CSS</span>
          <span className="tech-tag">Redux</span>
          <span className="tech-tag">REST APIs</span>
          <span className="tech-tag">GraphQL</span>
          <span className="tech-tag">WebSocket</span>
          <span className="tech-tag">AWS</span>
          <span className="tech-tag">Docker</span>
          <span className="tech-tag">CI/CD</span>
          <span className="tech-tag">Prisma</span>
          <span className="tech-tag">Socket.IO</span>
          <span className="tech-tag">Zustand</span>
          <span className="tech-tag">TanStack Query</span>

          <span className="tech-tag">AI Agents</span>
          <span className="tech-tag">Prompt Engineering</span>

          <span className="tech-tag">Automation</span>
        </div>
      </div>
    </header>
  );
}
