import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { Editor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import imageCompression from "browser-image-compression";
import { generateHTML } from "../../../lib/tiptap-render";
import { presignUpload, getPublicUrl, generateInlineKey, getExtFromFilename } from "../../../lib/s3";

const lowlight = createLowlight(common);

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: "image/webp",
};

export default function AdminPostEdit({ post, tags, session }) {
  const router = useRouter();
  const { id } = router.query;
  const isNew = id === "new";

  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [status, setStatus] = useState(post?.status || "DRAFT");
  const [selectedTags, setSelectedTags] = useState(post?.tags?.map((t) => t.id) || []);
  const [saveStatus, setSaveStatus] = useState("saved");
  const [saveError, setSaveError] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);

  const editorRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const compressAndUpload = async (file, kind, postSlug) => {
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);
    const ext = "webp";
    const key = kind === "cover"
      ? (postSlug ? `blog/coverImages/${postSlug}.${ext}` : `blog/coverImages/${Date.now()}.${ext}`)
      : `blog/postImages/${Math.random().toString(36).substring(2, 15)}.${ext}`;

    const uploadRes = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, filename: `${key}.${ext}`, contentType: "image/webp", postSlug }),
    });
    const { uploadUrl, publicUrl } = await uploadRes.json();
    await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": "image/webp" }, body: compressedFile });
    return publicUrl;
  };

  const editor = useRef(
    new Editor({
      extensions: [
        StarterKit.configure({ codeBlock: false }),
        Image.configure({
          HTMLAttributes: { class: "tiptap-image" },
          addImage: async ({ file }) => {
            return compressAndUpload(file, "inline", slug);
          },
        }),
        Link.configure({ openOnClick: false, HTMLAttributes: { class: "tiptap-link", target: "_blank", rel: "noopener noreferrer" } }),
        CodeBlockLowlight.configure({ lowlight }),
      ],
      content: post?.contentJson || { type: "doc", content: [] },
      editorProps: { attributes: { class: "tiptap-editor" } },
      onUpdate: ({ editor }) => {
        setSaveStatus("dirty");
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => autosave(), 1500);
      },
    })
  ).current;

  const autosave = useCallback(async () => {
    if (!editor || !editor.getJSON) return;
    try {
      const contentJson = editor.getJSON();
      const contentHtml = await generateHTML(contentJson);
      await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentJson, contentHtml, title, slug, excerpt, coverImage, tags: selectedTags }),
      });
      setSaveStatus("saving");
      setTimeout(() => setSaveStatus("saved"), 800);
    } catch {
      setSaveStatus("error");
    }
  }, [editor, id, title, slug, excerpt, coverImage, selectedTags]);

  const handleSave = async (newStatus) => {
    if (!editor) return;
    setIsPublishing(true);
    try {
      const contentJson = editor.getJSON();
      const contentHtml = await generateHTML(contentJson);
      await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentJson, contentHtml, title, slug, excerpt, coverImage, status: newStatus, tags: selectedTags }),
      });
      setSaveStatus("saved");
      setStatus(newStatus);
      if (newStatus === "PUBLISHED" && post?.status !== "PUBLISHED") {
        router.push(`/blog/${slug}`);
      }
    } catch (err) {
      setSaveError(err.message);
      setSaveStatus("error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCoverUpload = async (file) => {
    const publicUrl = await compressAndUpload(file, "cover", slug);
    setCoverImage(publicUrl);
  };

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt || "");
      setCoverImage(post.coverImage || "");
      setStatus(post.status);
      setSelectedTags(post.tags?.map((t) => t.id) || []);
    }
  }, [post]);

  useEffect(() => () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); }, []);

  if (!post && !isNew) return <div className="editor-placeholder">Loading…</div>;

  return (
    <div className="admin-editor">
      <main className="editor-main">
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</button>
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</button>
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</button>
          </div>
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold"><strong>B</strong></button>
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic"><em>I</em></button>
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().toggleCode().run()} title="Inline code"><code/></button>
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().toggleStrike().run()} title="Strikethrough"><s>S</s></button>
          </div>
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet list">•</button>
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Ordered list">1.</button>
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Blockquote">❝</button>
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().setCodeBlock().run()} title="Code block">{"/\\"}</button>
          </div>
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn" onClick={() => {
              const url = prompt("Enter URL:");
              if (url) editor?.chain().focus().setLink({ href: url }).run();
            }} title="Add link">🔗</button>
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().setImage({ src: "" }).run()} title="Add image">🖼</button>
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().setHorizontalRule().run()} title="Horizontal rule">—</button>
          </div>
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().undo().run()} title="Undo" disabled={!editor?.can().undo()}>↶</button>
            <button type="button" className="toolbar-btn" onClick={() => editor?.chain().focus().redo().run()} title="Redo" disabled={!editor?.can().redo()}>↷</button>
          </div>
        </div>

        <div className="editor-wrapper">
          <EditorContent editor={editor} className="editor-content" />
        </div>

        <footer className="editor-footer">
          <div className="editor-status">
            <span className={`status-indicator ${saveStatus}`}></span>
            <span>{saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "All changes saved" : saveStatus === "dirty" ? "Unsaved changes" : "Error"}</span>
          </div>
          <div style={{ display: "flex", gap: "12px" }}>
            <button className={`btn publish-btn ${status === "PUBLISHED" ? "published" : "draft"}`} onClick={() => handleSave(status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")} disabled={isPublishing}>
              {status === "PUBLISHED" ? "Unpublish" : "Publish"}
            </button>
            <button className="btn btn-secondary" onClick={() => handleSave("DRAFT")} disabled={isPublishing}>
              Save draft
            </button>
          </div>
        </footer>
      </main>

      <aside className="editor-sidebar">
        <section className="sidebar-section">
          <h3 className="sidebar-section-title">Title & Slug</h3>
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title</label>
            <input id="title" type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
          </div>
          <div className="form-group">
            <label htmlFor="slug" className="form-label">Slug</label>
            <input id="slug" type="text" className="form-input" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="auto-generated" />
            <p className="form-hint">Used in URL: /blog/<strong>{slug}</strong></p>
          </div>
        </section>

        <section className="sidebar-section">
          <h3 className="sidebar-section-title">Excerpt</h3>
          <div className="form-group">
            <textarea className="form-textarea" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short description for listings and SEO" rows={3} />
          </div>
        </section>

        <section className="sidebar-section">
          <h3 className="sidebar-section-title">Cover Image</h3>
          <div className="cover-upload">
            <input type="file" accept="image/*" className="form-input" onChange={(e) => e.target.files[0] && handleCoverUpload(e.target.files[0])} />
            {coverImage && <img src={coverImage} alt="Cover preview" className="cover-preview" />}
          </div>
        </section>

        <section className="sidebar-section">
          <h3 className="sidebar-section-title">Tags</h3>
          <div className="tag-select">
            {tags.map((tag) => (
              <label key={tag.id} className={`tag-option ${selectedTags.includes(tag.id) ? "selected" : ""}`}>
                <input type="checkbox" value={tag.id} checked={selectedTags.includes(tag.id)} onChange={(e) => setSelectedTags(e.target.checked ? [...selectedTags, tag.id] : selectedTags.filter((id) => id !== tag.id))} />
                {tag.name}
              </label>
            ))}
          </div>
        </section>

        <section className="sidebar-section">
          <h3 className="sidebar-section-title">Status</h3>
          <div className="form-group">
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </section>

        {saveError && (
          <section className="sidebar-section" style={{ borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.05)" }}>
            <p style={{ color: "#ef4444", fontSize: "13px", margin: 0 }}>{saveError}</p>
          </section>
        )}
      </aside>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { getServerSession } = await import("next-auth");
  const { authOptions } = await import("../../lib/auth");
  const { prisma } = await import("../../lib/db");

  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  const { id } = context.params;
  const isNew = id === "new";

  let post = null;
  if (!isNew) {
    post = await prisma.post.findUnique({
      where: { id },
      include: { tags: true },
    });
    if (!post || post.authorId !== session.user.id) {
      return { notFound: true };
    }
  }

  const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return { props: { post, tags: allTags, session } };
}