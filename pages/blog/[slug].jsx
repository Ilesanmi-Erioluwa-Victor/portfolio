import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import Nav from "../../components/Nav";
import Footer from "../../components/Footer";

const POSTS = {
  "building-scalable-react-apps": {
    title: "Building Scalable React Applications",
    date: "2025-12-15",
    readTime: "8 min read",
    excerpt: "Lessons learned from architecting React frontends that serve thousands of users.",
    tags: ["React", "Architecture"],
    content: `
      <p>Building React applications that scale isn't just about writing more code — it's about writing the <em>right</em> code. Over the past few years working on platforms serving 12K+ users, I've learned a few things about what works and what doesn't.</p>

      <h2>Component Composition Over Inheritance</h2>
      <p>React's composition model is one of its greatest strengths. Rather than building monolithic components, break your UI into small, focused pieces that can be composed together. A well-designed component should do one thing and do it well.</p>
      <p>For example, instead of a single <code>Dashboard</code> component that handles everything, break it into <code>DashboardLayout</code>, <code>MetricsCard</code>, <code>ActivityFeed</code>, and <code>QuickActions</code>. Each can be developed, tested, and reused independently.</p>

      <h2>State Management That Scales</h2>
      <p>Start with React's built-in state management — <code>useState</code> and <code>useReducer</code>. Only reach for external libraries like Zustand or Redux when you actually need them. I've found that most apps can go surprisingly far with just context and reducers.</p>
      <p>When you do need global state, prefer atomic state managers (Jotai, Recoil) or simple stores (Zustand) over Redux. They have less boilerplate and better performance characteristics for most use cases.</p>

      <h2>Performance Patterns</h2>
      <p>Three things that make the biggest difference:</p>
      <ul>
        <li><strong>Memoization:</strong> Use <code>React.memo</code> and <code>useMemo</code> judiciously — not everywhere, but on expensive computations and components that re-render often.</li>
        <li><strong>Code splitting:</strong> Lazy-load routes and heavy components with <code>React.lazy</code> and <code>Suspense</code>.</li>
        <li><strong>Virtualization:</strong> For long lists, use libraries like <code>react-window</code> to only render what's visible.</li>
      </ul>
    `,
  },
  "real-time-features-with-websockets": {
    title: "Real-time Features with WebSockets in Node.js",
    date: "2025-11-02",
    readTime: "6 min read",
    excerpt: "How to implement live chat, notifications, and collaborative features using WebSocket events.",
    tags: ["Node.js", "WebSockets"],
    content: `
      <p>Real-time features — live chat, notifications, collaborative editing — are table stakes for modern web apps. Here's how I approach building them with WebSockets in a Node.js backend.</p>

      <h2>Choosing Your Library</h2>
      <p>For most projects, <a href="https://socket.io" target="_blank" rel="noopener noreferrer">Socket.IO</a> is the pragmatic choice. It handles reconnection, fallback to long-polling, rooms, and namespaces out of the box. For simpler needs, the <code>ws</code> library is lighter but requires more manual work.</p>

      <h2>Architecture</h2>
      <p>I structure real-time features around these concepts:</p>
      <ul>
        <li><strong>Rooms:</strong> Group sockets by context — chat rooms, document sessions, or user-specific notification channels.</li>
        <li><strong>Events:</strong> Use typed event contracts so both client and server agree on payloads. I define these as shared TypeScript types.</li>
        <li><strong>Authentication:</strong> Authenticate on connection via JWT tokens in the handshake. Don't trust the client — validate every action server-side.</li>
      </ul>

      <h2>Scaling Considerations</h2>
      <p>Socket.IO supports the Redis adapter for horizontal scaling. When you have multiple Node.js instances, the Redis adapter broadcasts events across all instances so every connected client receives the message regardless of which server they're connected to.</p>
    `,
  },
  "ci-cd-pipelines-for-startups": {
    title: "CI/CD Pipelines That Actually Work for Startups",
    date: "2025-09-20",
    readTime: "5 min read",
    excerpt: "A practical guide to setting up GitHub Actions for automated testing, building, and deploying.",
    tags: ["DevOps", "AWS"],
    content: `
      <p>CI/CD shouldn't be a complex beast that requires a dedicated DevOps engineer. For startups, the goal is simple: ship code safely and quickly. Here's the setup I've used across multiple projects.</p>

      <h2>GitHub Actions as the Foundation</h2>
      <p>GitHub Actions is free for public repos and generous for private ones. It integrates directly with your repository, so there's no separate CI service to manage. Here's what a typical workflow looks like:</p>
      <ul>
        <li><strong>Pull Request:</strong> Run linting, type checking, and unit tests. Block merging if any fail.</li>
        <li><strong>Main branch push:</strong> Run the full test suite, build the application, and deploy to staging.</li>
        <li><strong>Release tag:</strong> Deploy to production with a manual approval step.</li>
      </ul>

      <h2>AWS Deployment</h2>
      <p>For a typical Node.js + React stack on AWS:</p>
      <ul>
        <li><strong>EC2:</strong> Run the Node.js backend. Use a launch template so you can replace instances easily.</li>
        <li><strong>RDS:</strong> Managed PostgreSQL. Enable automated backups and multi-AZ for production.</li>
        <li><strong>Deploy strategy:</strong> GitHub Actions SSHes into EC2, pulls the latest code, installs dependencies, runs migrations, and restarts the PM2 process.</li>
      </ul>

      <h2>Keep It Simple</h2>
      <p>Don't jump to Kubernetes or complex orchestration until you actually need it. A single EC2 instance with PM2, RDS, and GitHub Actions has served startups well into thousands of users. Add complexity only when the existing setup shows strain.</p>
    `,
  },
};

export default function BlogPost() {
  const router = useRouter();
  const { slug } = router.query;

  if (router.isFallback || !slug) {
    return (
      <div className="blog-page">
        <Nav />
        <div className="col" style={{ paddingTop: "100px", textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const post = POSTS[slug];

  if (!post) {
    return (
      <div className="blog-page">
        <Nav />
        <div className="col" style={{ paddingTop: "100px", textAlign: "center" }}>
          <h1>Post not found</h1>
          <Link href="/blog" className="blog-back">← Back to blog</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{post.title} — Ilesanmi Erioluwa Victor</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <div className="blog-page">
        <Nav />

        <div className="col">
          <div className="blog-post-header">
            <Link href="/blog" className="blog-back">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M10.5 3.5L5.5 8L10.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to blog
            </Link>
            <h1 className="blog-post-title">{post.title}</h1>
            <div className="blog-post-meta">
              <span className="blog-card-date">{post.date}</span>
              <span className="blog-card-time">{post.readTime}</span>
              <div className="blog-card-tags">
                {post.tags.map((tag) => (
                  <span key={tag} className="blog-card-tag">{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <article className="blog-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        <Footer />
      </div>
    </>
  );
}