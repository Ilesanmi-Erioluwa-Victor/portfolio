import Link from "next/link";
import Head from "next/head";
import Footer from "../components/Footer";
import { SIGNATURE_SVG } from "../data/signature";

export default function Resume() {
  return (
    <>
      <Head>
        <title>Resume — Ilesanmi Erioluwa Victor</title>
      </Head>
      <div className="blog-page">
        <div className="col">
          <header className="blog-header">
            <div className="resume-header-row">
              <Link href="/" className="blog-back">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 3L5 8l5 5" />
                </svg>
                <span className="txt">Back</span>
              </Link>
              <a href="/Resume.pdf" download className="resume-dl">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 10v2.67A1.33 1.33 0 0112.67 14H3.33A1.33 1.33 0 012 12.67V10" />
                  <path d="M4.67 6.67L8 10l3.33-3.33" />
                  <path d="M8 10V2" />
                </svg>
                <span className="txt">Download PDF</span>
              </a>
            </div>
          </header>

          <div className="resume-paper">
            <div className="resume-section resume-intro">
              <h1 className="resume-name">Ilesanmi Erioluwa Victor</h1>
              <div className="resume-subtitle">
                Full Stack Developer | React | Node.js/Express | Fintech Platforms | AWS
              </div>
              <div className="resume-contact">
                Lagos, Nigeria &bull; ilesanmierioluwavictor@gmail.com &bull; +2348081495166
              </div>
              <div className="resume-links">
                <a href="https://linkedin.com/in/ilesanmi-erioluwa-victor" target="_blank" rel="noopener noreferrer">linkedin.com/in/ilesanmi-erioluwa-victor</a>
                <span className="resume-link-sep">&bull;</span>
                <a href="https://github.com/ilesanmierioluwa" target="_blank" rel="noopener noreferrer">github.com/ilesanmierioluwa</a>
                <span className="resume-link-sep">&bull;</span>
                <a href="https://x.com/ilesanmiEri" target="_blank" rel="noopener noreferrer">x.com/ilesanmiEri</a>
                <span className="resume-link-sep">&bull;</span>
                <a href="https://instagram.com/ilesanmierioluwa" target="_blank" rel="noopener noreferrer">instagram.com/ilesanmierioluwa</a>
              </div>
              <div className="resume-accent" />
            </div>

            <div className="resume-section">
              <h2 className="resume-heading">Professional Summary</h2>
              <p className="resume-text">
                Full Stack Software Engineer and product builder focused on creating
                scalable, user-centered digital products. I specialize in React, Next.js,
                Node.js, and TypeScript, combining engineering, product thinking, and
                human-centered design to turn ideas into useful experiences. I build
                modular, documented components end-to-end, integrate RESTful APIs and
                real-time WebSocket events, and work with PostgreSQL, MySQL, and
                MongoDB-backed services. Comfortable with authentication flows, code
                reviews, and deploying to AWS (EC2/RDS) with CI/CD pipelines (GitHub
                Actions).
              </p>
            </div>

            <div className="resume-section">
              <h2 className="resume-heading">Technical Skills</h2>
              <div className="resume-skill-line">
                <strong>Frontend:</strong> <span>React, Next.js, TypeScript, JavaScript (ES6+), Redux Toolkit, TanStack Query, Zustand, Tailwind CSS</span>
              </div>
              <div className="resume-skill-line">
                <strong>Backend &amp; APIs:</strong> <span>Node.js, Express.js, RESTful API design &amp; integration, GraphQL, WebSockets (Socket.IO), authentication flows</span>
              </div>
              <div className="resume-skill-line">
                <strong>Databases:</strong> <span>PostgreSQL, MySQL, MongoDB, Prisma</span>
              </div>
              <div className="resume-skill-line">
                <strong>Fintech Domain:</strong> <span>Mobile crypto wallet product, wallet balance &amp; transaction history, deposit/withdrawal flows, KYC onboarding, P2P trade management, real-time wallet/transaction status (Socket.IO)</span>
              </div>
              <div className="resume-skill-line">
                <strong>AI &amp; Automation:</strong> <span>OpenAI API, Claude API, LangChain, LLMs, AI Agents, Prompt Engineering, RAG, automated content generation &amp; scheduling</span>
              </div>
              <div className="resume-skill-line">
                <strong>Cloud &amp; DevOps:</strong> <span>AWS (EC2 &amp; RDS), Docker, CI/CD (GitHub Actions), Git/GitHub</span>
              </div>
              <div className="resume-skill-line">
                <strong>Engineering Practices:</strong> <span>Code reviews, clean architecture &amp; documentation, technical/API documentation, Agile/Scrum, sprint planning &amp; retrospectives, debugging &amp; production issue resolution</span>
              </div>
            </div>

            <div className="resume-section">
              <h2 className="resume-heading">Professional Experience</h2>

              <div className="resume-exp">
                <div className="resume-exp-title">
                  Full Stack Engineer — AbS Technologies
                </div>
                <div className="resume-exp-date">Mar 2024 – Present</div>
                <ul className="resume-list">
                  <li>
                    Built and maintained modular React and TypeScript frontend components
                    and Node.js backend services for a large-scale platform serving
                    students, administrators, and internal stakeholders.
                  </li>
                  <li>
                    Integrated RESTful and GraphQL APIs and third-party services,
                    handling authentication, pagination, and error states; stepped directly
                    into the Node.js backend when features required backend changes.
                  </li>
                  <li>
                    Refactored large sections of the codebase into reusable, documented
                    components, improving maintainability and reducing technical debt.
                  </li>
                  <li>
                    Enforced clean architecture and coding standards through regular code
                    reviews, and collaborated across Product and Design in full Agile
                    sprint cycles.
                  </li>
                  <li>
                    Contributed to CI/CD pipelines (GitHub Actions) and AWS EC2/RDS
                    deployments, improving deployment reliability and scalability.
                  </li>
                  <li>
                    Debugged and resolved production issues end-to-end, improving
                    application performance and reliability.
                  </li>
                </ul>
              </div>

              <div className="resume-exp">
                <div className="resume-exp-title">
                  Frontend Engineer — DigiYo
                </div>
                <div className="resume-exp-date">Jul 2025 – Mar 2026</div>
                <ul className="resume-list">
                  <li>
                    Built responsive React and TypeScript components from design
                    specifications, maintaining consistency with the platform&rsquo;s shared
                    design system.
                  </li>
                  <li>
                    Implemented real-time UI updates via WebSockets (Socket.IO) for
                    notification counts, chat indicators, and live feed updates,
                    integrating REST API responses directly into components.
                  </li>
                  <li>
                    Collaborated with backend engineers on API contracts and participated
                    in code reviews and sprint planning within an agile team.
                  </li>
                </ul>
              </div>

              <div className="resume-exp">
                <div className="resume-exp-title">
                  Frontend Engineer — HelloBob
                </div>
                <div className="resume-exp-date">Nov 2024 – Jun 2025</div>
                <ul className="resume-list">
                  <li>
                    Built React interfaces for a mobile crypto wallet product, including
                    wallet balance display, transaction history, deposit/withdrawal flows,
                    and KYC onboarding steps.
                  </li>
                  <li>
                    Integrated REST APIs and WebSocket (Socket.IO) real-time events for
                    live wallet status and transaction state changes, handling
                    authentication and edge-case states.
                  </li>
                  <li>
                    Built P2P trade management UI (trade listings, status tracking, bank
                    account management) to backend-provided API contracts, maintaining
                    reliability across loading, error, and partial-payload states.
                  </li>
                  <li>
                    Participated in code reviews and design handoffs within a
                    cross-functional fintech product team.
                  </li>
                </ul>
              </div>
            </div>

            <div className="resume-section">
              <h2 className="resume-heading">Projects</h2>
              <div className="resume-exp">
                <div className="resume-exp-title">
                  Jobify
                </div>
                <div className="resume-list" style={{ paddingLeft: 0 }}>
                  <div className="resume-text">
                    A job management platform where users create, edit, and manage job
                    listings with dynamic status tracking for pending applications,
                    scheduled interviews, and declined jobs. Built with React, Node.js,
                    MongoDB, and REST APIs.
                  </div>
                </div>
              </div>
              <div className="resume-exp">
                <div className="resume-exp-title">
                  Automated Blog Posting Backend
                </div>
                <div className="resume-list" style={{ paddingLeft: 0 }}>
                  <div className="resume-text">
                    An AI-powered automated blogging engine that generates and schedules
                    blog posts across three daily sessions (morning, afternoon, night)
                    with six posts per session. Leverages LLMs (OpenAI/Claude) for
                    content generation, prompt engineering for quality control, and
                    automated scheduling for hands-off publishing. Built with Node.js,
                    Express, and REST APIs.
                  </div>
                </div>
              </div>
              <div className="resume-exp">
                <div className="resume-exp-title">
                  4TK Shop — <a href="https://4tk.shop" target="_blank" rel="noopener noreferrer" className="resume-text-link">4tk.shop</a>
                </div>
                <div className="resume-list" style={{ paddingLeft: 0 }}>
                  <div className="resume-text">
                    A full-stack e-commerce application for a client with product search,
                    filter, sort, pagination, single product detail pages, and payment
                    checkout. Built with React, Node.js, and REST APIs.
                  </div>
                </div>
              </div>
            </div>

            <div className="resume-section">
              <h2 className="resume-heading">Certifications</h2>
              <div className="resume-list" style={{ paddingLeft: 0 }}>
                <div className="resume-text">
                  JavaScript Algorithms and Data Structures, FreeCodeCamp, 2022.
                </div>
                <div className="resume-text">
                  Responsive Web Design, FreeCodeCamp, 2021.
                </div>
                <div className="resume-text">
                  Software Development Associate Engineer Certification, Paradigm Initiative, 2019.
                </div>
              </div>
            </div>

            <div className="resume-section">
              <h2 className="resume-heading">Education</h2>
              <div className="resume-exp">
                <div className="resume-exp-title">
                  HND in Computer Science (in progress)
                </div>
                <div className="resume-exp-date">Delta State Polytechnic</div>
              </div>
              <div className="resume-exp">
                <div className="resume-exp-title">
                  OND in Computer Science
                </div>
                <div className="resume-exp-date">October 2023 – 2024 | Delta, Nigeria</div>
                <div className="resume-exp-date">Delta State Polytechnic</div>
              </div>
            </div>
          </div>
        </div>

        <section className="outro">
          <Footer signatureSvg={SIGNATURE_SVG} dedupe />
        </section>
      </div>
    </>
  );
}