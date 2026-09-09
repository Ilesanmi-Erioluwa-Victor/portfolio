import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import imageCompression from "browser-image-compression";
import { renderContentToHtml } from "../../../lib/actions";

const lowlight = createLowlight(common);

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-align") || "center",
        renderHTML: (attrs) => ({ "data-align": attrs.align || "center" }),
      },
    };
  },
});

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
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(post?.coverImage || "");
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverError, setCoverError] = useState(null);
  const coverInputRef = useRef(null);
  const previewUrlRef = useRef(null);
  const inlineImageInputRef = useRef(null);
  const [inlineUploading, setInlineUploading] = useState(false);
  const [inlineError, setInlineError] = useState(null);
  const [selVersion, setSelVersion] = useState(0);

  const saveTimeoutRef = useRef(null);

  const compressAndUpload = async (file, kind, postSlug) => {
    const compressedFile = await imageCompression(file, COMPRESSION_OPTIONS);

    const uploadRes = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, filename: "cover.webp", contentType: "image/webp", postSlug }),
    });
    const presign = await uploadRes.json().catch(() => ({}));
    if (!uploadRes.ok) {
      throw new Error(presign.error || `Upload request failed (${uploadRes.status})`);
    }
    const { uploadUrl, publicUrl } = presign;
    if (!uploadUrl || !publicUrl) {
      throw new Error("Upload request returned no URL. Check S3 env vars.");
    }
    let putRes;
    try {
      putRes = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": "image/webp" }, body: compressedFile });
    } catch {
      throw new Error("Could not reach S3. Check bucket CORS for localhost:3000 and your network.");
    }
    if (!putRes.ok) {
      throw new Error(`S3 upload failed (${putRes.status}). Check bucket policy/CORS and key permissions.`);
    }
    return publicUrl;
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3, 4] },
      }),
      Underline,
      Placeholder.configure({
        placeholder: "Start writing your post… Use the toolbar for headings, lists, quotes, code, and images.",
      }),
      ResizableImage.configure({
        HTMLAttributes: { class: "tiptap-image" },
        allowBase64: false,
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "tiptap-link", target: "_blank", rel: "noopener noreferrer" } }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: post?.contentJson || { type: "doc", content: [{ type: "paragraph" }] },
    editorProps: { attributes: { class: "tiptap-editor" } },
    onSelectionUpdate: () => {
      setSelVersion((v) => v + 1);
    },
    onUpdate: () => {
      setSelVersion((v) => v + 1);
      setSaveStatus("dirty");
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => autosaveRef.current?.(), 1500);
    },
  });

  const inTable = !!editor?.isActive("table");
  const imageActive = !!editor?.isActive("image");
  const imageAttrs = editor?.getAttributes("image") || {};
  const imageWidth = parseInt(imageAttrs.width, 10) || 640;
  void selVersion;

  const autosave = useCallback(async () => {
    if (!editor || !editor.getJSON) return;
    try {
      const contentJson = editor.getJSON();
      const contentHtml = await renderContentToHtml(contentJson);
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

  const autosaveRef = useRef(null);
  autosaveRef.current = autosave;

  const handleInlineImage = async (file) => {
    if (!file || !editor) return;
    if (!file.type.startsWith("image/")) {
      setInlineError("Please select an image file.");
      return;
    }
    if (!slug?.trim()) {
      setInlineError("Set a slug first so the image has a stable path.");
      return;
    }
    setInlineUploading(true);
    setInlineError(null);
    try {
      const publicUrl = await compressAndUpload(file, "inline", slug.trim());
      editor.chain().focus().setImage({ src: publicUrl }).run();
    } catch (err) {
      setInlineError(err.message || "Image upload failed");
    } finally {
      setInlineUploading(false);
      if (inlineImageInputRef.current) inlineImageInputRef.current.value = "";
    }
  };

  const handleSave = async (newStatus) => {
    if (!editor) return;
    setIsPublishing(true);
    setSaveError(null);
    try {
      const finalCoverImage = await uploadCoverIfNeeded();
      const contentJson = editor.getJSON();
      const contentHtml = await renderContentToHtml(contentJson);
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentJson, contentHtml, title, slug, excerpt, coverImage: finalCoverImage, status: newStatus, tags: selectedTags }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save post");
      }
      setSaveStatus("saved");
      setStatus(newStatus);
      if (newStatus === "PUBLISHED" && post?.status !== "PUBLISHED") {
        router.push(`/blog/${slug}`);
      }
    } catch (err) {
      setSaveError(err.message);
      if (coverFile) setCoverError(err.message);
      setSaveStatus("error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCoverSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setCoverError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCoverError("Image must be less than 5MB.");
      return;
    }
    setCoverError(null);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setCoverFile(file);
    setCoverPreview(url);
  };

  const handleRemoveCover = () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    setCoverFile(null);
    setCoverPreview("");
    setCoverImage("");
    setCoverError(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const uploadCoverIfNeeded = async () => {
    if (!coverFile) return coverImage;
    if (!slug?.trim()) throw new Error("Save a slug first before publishing a cover image.");
    setCoverUploading(true);
    try {
      const publicUrl = await compressAndUpload(coverFile, "cover", slug.trim());
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
      setCoverFile(null);
      setCoverImage(publicUrl);
      setCoverPreview(publicUrl);
      return publicUrl;
    } finally {
      setCoverUploading(false);
    }
  };

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setSlug(post.slug);
      setExcerpt(post.excerpt || "");
      setCoverImage(post.coverImage || "");
      setCoverPreview(post.coverImage || "");
      setCoverFile(null);
      setCoverError(null);
      setStatus(post.status);
      setSelectedTags(post.tags?.map((t) => t.id) || []);
    }
  }, [post]);

  useEffect(() => () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  if (!post && !isNew) return <div className="editor-placeholder">Loading…</div>;
  if (!editor) return <div className="editor-placeholder">Loading editor…</div>;

  const tb = (name, attrs) => `toolbar-btn${editor.isActive(name, attrs) ? " active" : ""}`;

  return (
    <div className="admin-editor">
      <main className="editor-main">
        <div className="editor-toolbar">
          <div className="toolbar-group">
            <button type="button" className={tb("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</button>
            <button type="button" className={tb("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</button>
            <button type="button" className={tb("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</button>
            <button type="button" className={tb("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} title="Heading 4">H4</button>
            <button type="button" className={tb("paragraph")} onClick={() => editor.chain().focus().setParagraph().run()} title="Body text">¶</button>
          </div>
          <div className="toolbar-group">
            <button type="button" className={tb("bold")} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><strong>B</strong></button>
            <button type="button" className={tb("italic")} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><em>I</em></button>
            <button type="button" className={tb("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline"><u>U</u></button>
            <button type="button" className={tb("strike")} onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><s>S</s></button>
            <button type="button" className={tb("code")} onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code"><code>&lt;&gt;</code></button>
          </div>
          <div className="toolbar-group">
            <button type="button" className={tb("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">• List</button>
            <button type="button" className={tb("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">1. List</button>
            <button type="button" className={tb("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">❝</button>
            <button type="button" className={tb("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">{"{ }"}</button>
          </div>
          <div className="toolbar-group">
            <button type="button" className={`toolbar-btn${editor.isActive({ textAlign: "left" }) ? " active" : ""}`} onClick={() => editor.chain().focus().setTextAlign("left").run()} title="Align left">⇤</button>
            <button type="button" className={`toolbar-btn${editor.isActive({ textAlign: "center" }) ? " active" : ""}`} onClick={() => editor.chain().focus().setTextAlign("center").run()} title="Align center">⇔</button>
            <button type="button" className={`toolbar-btn${editor.isActive({ textAlign: "right" }) ? " active" : ""}`} onClick={() => editor.chain().focus().setTextAlign("right").run()} title="Align right">⇥</button>
            <button type="button" className={`toolbar-btn${editor.isActive({ textAlign: "justify" }) ? " active" : ""}`} onClick={() => editor.chain().focus().setTextAlign("justify").run()} title="Justify">☰</button>
          </div>
          <div className="toolbar-group">
            <button type="button" className={tb("link")} onClick={() => {
              const prev = editor.getAttributes("link").href || "";
              const url = prompt("Link URL:", prev);
              if (url === null) return;
              if (!url) {
                editor.chain().focus().unsetLink().run();
                return;
              }
              editor.chain().focus().setLink({ href: url }).run();
            }} title="Add / edit link">🔗</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().unsetLink().run()} title="Remove link">⛓‍💥</button>
            <button type="button" className="toolbar-btn" onClick={() => inlineImageInputRef.current?.click()} disabled={inlineUploading} title="Upload and insert image">
              {inlineUploading ? "…" : "🖼"}
            </button>
            <input ref={inlineImageInputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handleInlineImage(e.target.files[0])} />
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">—</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().clearNodes().run()} title="Clear formatting">🧹</button>
          </div>
          <div className="toolbar-group">
            <button type="button" className={`toolbar-btn${editor.isActive("table") ? " active" : ""}`} onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Insert table">▦ Table</button>
          </div>
          <div className="toolbar-group">
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}>↶</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}>↷</button>
          </div>
        </div>
        {inTable && (
          <div className="editor-contextbar" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", padding: "10px 12px", background: "var(--overlay)", border: "1px solid var(--border)", borderRadius: "10px", marginBottom: "12px", fontSize: "13px" }}>
            <strong>Table:</strong>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().addRowBefore().run()} title="Add row above">+ Row ↑</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().addRowAfter().run()} title="Add row below">+ Row ↓</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().deleteRow().run()} title="Delete row">− Row</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().addColumnBefore().run()} title="Add column left">+ Col ←</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().addColumnAfter().run()} title="Add column right">+ Col →</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().deleteColumn().run()} title="Delete column">− Col</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().mergeCells().run()} title="Merge cells">⫼ Merge</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().splitCell().run()} title="Split cell">⫼ Split</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().toggleHeaderRow().run()} title="Toggle header row">Header</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().deleteTable().run()} title="Delete table">🗑 Table</button>
          </div>
        )}
        {imageActive && (
          <div className="editor-contextbar" style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center", padding: "10px 12px", background: "var(--overlay)", border: "1px solid var(--border)", borderRadius: "10px", marginBottom: "12px", fontSize: "13px" }}>
            <strong>Image:</strong>
            <button type="button" className={`toolbar-btn${imageAttrs.align === "left" ? " active" : ""}`} onClick={() => editor.chain().focus().updateAttributes("image", { align: "left" }).run()} title="Align left">◧</button>
            <button type="button" className={`toolbar-btn${(!imageAttrs.align || imageAttrs.align === "center") ? " active" : ""}`} onClick={() => editor.chain().focus().updateAttributes("image", { align: "center" }).run()} title="Center">⬒</button>
            <button type="button" className={`toolbar-btn${imageAttrs.align === "right" ? " active" : ""}`} onClick={() => editor.chain().focus().updateAttributes("image", { align: "right" }).run()} title="Align right">◨</button>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Size
              <input
                type="range"
                min={120}
                max={1000}
                step={10}
                value={Math.min(1000, Math.max(120, imageWidth))}
                onChange={(e) => editor.chain().focus().updateAttributes("image", { width: String(e.target.value) }).run()}
                style={{ width: "140px" }}
              />
              <span style={{ minWidth: "52px", color: "var(--muted)" }}>{Math.min(1000, Math.max(120, imageWidth))}px</span>
            </label>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().updateAttributes("image", { width: "320" }).run()} title="Small">S</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().updateAttributes("image", { width: "640" }).run()} title="Medium">M</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().updateAttributes("image", { width: "100%" }).run()} title="Full width">Full</button>
            <button type="button" className="toolbar-btn" onClick={() => editor.chain().focus().deleteSelection().run()} title="Remove image">✕ Remove</button>
          </div>
        )}
        {inlineError && <p role="alert" style={{ color: "#ef4444", fontSize: "13px", margin: "0 0 8px" }}>{inlineError}</p>}

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
            {coverPreview ? (
              <div>
                <img src={coverPreview} alt="Cover preview" className="cover-preview" />
                <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                  <label className="btn btn-secondary" style={{ height: "32px", padding: "0 14px", cursor: "pointer" }}>
                    Change
                    <input ref={coverInputRef} type="file" accept="image/*" hidden disabled={coverUploading || isPublishing} onChange={(e) => e.target.files[0] && handleCoverSelect(e.target.files[0])} />
                  </label>
                  <button type="button" className="btn btn-ghost" style={{ height: "32px", padding: "0 14px", color: "#ef4444" }} disabled={coverUploading || isPublishing} onClick={handleRemoveCover}>
                    Remove
                  </button>
                </div>
                {coverFile && <p className="form-hint">Not uploaded yet — uploads when you save or publish.</p>}
              </div>
            ) : (
              <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
                Select image
                <input ref={coverInputRef} type="file" accept="image/*" hidden disabled={coverUploading || isPublishing} onChange={(e) => e.target.files[0] && handleCoverSelect(e.target.files[0])} />
              </label>
            )}
            {coverUploading && <p className="form-hint">Uploading…</p>}
            {coverError && <p role="alert" style={{ color: "#ef4444", fontSize: "13px" }}>{coverError}</p>}
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
  const { authOptions } = await import("../../../lib/auth");
  const { prisma } = await import("../../../lib/db");

  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  const { id } = context.params;
  const isNew = id === "new";

  let authorId = session.user?.id;
  if (!authorId && session.user?.email) {
    const { prisma: prismaUser } = await import("../../../lib/db");
    const me = await prismaUser.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    authorId = me?.id;
  }

  let row = null;
  if (!isNew) {
    row = await prisma.post.findUnique({
      where: { id },
      include: { tags: true },
    });
    if (!row || (authorId && row.authorId !== authorId)) {
      return { notFound: true };
    }
  }

  const post = row
    ? {
        ...row,
        createdAt: row.createdAt ? row.createdAt.toISOString() : null,
        updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
        publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
      }
    : null;

  const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

  return { props: { post, tags: allTags, session } };
}