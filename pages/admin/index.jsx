import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { prisma } from "../../lib/db";
import Link from "next/link";

export default async function AdminIndex() {
  const session = await getServerSession({ req: {}, res: {}, ...authOptions });
  if (!session) return null;

  const posts = await prisma.post.findMany({
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, slug: true, status: true, updatedAt: true },
  });

  return (
    <div className="admin-index">
      <header>
        <h1>Posts</h1>
        <Link href="/admin/posts/new" className="btn primary">
          + New post
        </Link>
      </header>
      <div className="post-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Last updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id}>
                <td>
                  <Link href={`/admin/posts/${post.id}`}>
                    {post.title || "Untitled"}
                  </Link>
                </td>
                <td>
                  <span className={`status ${post.status.toLowerCase()}`}>
                    {post.status}
                  </span>
                </td>
                <td>
                  {new Date(post.updatedAt).toLocaleDateString()}
                </td>
                <td>
                  <Link href={`/admin/posts/${post.id}`} className="btn">
                    Edit
                  </Link>
                  {post.status === "PUBLISHED" && (
                    <a
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn ghost"
                    >
                      View
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export async function getServerSideProps() {
  const session = await getServerSession({ req: {}, res: {}, ...authOptions });
  if (!session) return { redirect: { destination: "/admin/login", permanent: false } };
  return { props: {} };
}