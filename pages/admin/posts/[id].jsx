import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";
import TiptapEditor from "../../../components/editor/TiptapEditor";

export default function EditPost() {
  return <EditPostForm />;
}

async function EditPostForm({ params }) {
  const session = await getServerSession({ req: {}, res: {}, ...authOptions });
  if (!session) return null;

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: { author: true, tags: true },
  });

  if (!post) {
    return { notFound: true };
  }

  const handleSave = async (postData) => {
    const updated = await prisma.post.update({
      where: { id: post.id },
      data: {
        title: postData.title,
        slug: postData.slug,
        excerpt: postData.excerpt,
        contentJson: postData.contentJson,
        contentHtml: postData.contentHtml,
        coverImage: postData.coverImage,
        status: postData.status,
      },
    });
    return updated;
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
      initialTitle={post.title}
      initialSlug={post.slug}
      initialExcerpt={post.excerpt}
      initialContent={post.contentJson}
      initialCoverImage={post.coverImage}
      initialStatus={post.status}
      onSave={handleSave}
      onPublish={handlePublish}
      onUnpublish={handleUnpublish}
      postId={post.id}
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