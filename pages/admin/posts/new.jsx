import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import TiptapEditor from "../../../components/editor/TiptapEditor";

export default function NewPost() {
  return (
    <div className="admin-new-post">
      <NewPostForm />
    </div>
  );
}

async function NewPostForm() {
  const session = await getServerSession({ req: {}, res: {}, ...authOptions });
  if (!session) return null;

  const handleSave = async (post) => {
    const created = await prisma.post.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        contentJson: post.contentJson,
        contentHtml: post.contentHtml,
        coverImage: post.coverImage,
        status: post.status,
        authorId: session.user.id,
      },
    });
    return created;
  };

  const handlePublish = async (postId) => {
    await prisma.post.update({
      where: { id: postId },
      data: { status: "PUBLISHED", publishedAt: new Date() },
    });
  };

  const handleUnpublish = async (postId) => {
    await prisma.post.update({
      where: { id: postId },
      data: { status: "DRAFT", publishedAt: null },
    });
  };

  return (
    <TiptapEditor
      onSave={handleSave}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
    />
  );
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }
  return { props: {} };
}