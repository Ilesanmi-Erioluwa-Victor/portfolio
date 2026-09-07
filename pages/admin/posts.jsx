import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

export default function AdminPosts({ session }) {
  return (
    <div className="admin-posts">
      <div className="admin-header">
        <h1>Posts</h1>
        <span className="user-email">Signed in as: {session.user?.email}</span>
      </div>
      <p className="placeholder">Posts list coming in Phase 4...</p>
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
}