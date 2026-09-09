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

function toLocalInput(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SidebarSection({ title, badge, open, onToggle, children }) {
  return (
    <section className="sidebar-section">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: 0, padding: 0, cursor: "pointer", font: "inherit" }}
      >
        <span className="sidebar-section-title" style={{ margin: 0 }}>
          {title} {badge ? <span style={{ color: "var(--soft)", fontWeight: 400 }}>{badge}</span> : null}
        </span>
        <span style={{ color: "var(--muted)", fontSize: "14px" }}>{open ? "▾" : "▸"}</span>
      </button>
      {open && <div style={{ marginTop: "16px" }}>{children}</div>}
    </section>
  );
}

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
  const [allTags, setAllTags] = useState(tags || []);
  const [newTagName, setNewTagName] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagError, setTagError] = useState(null);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [busyTagId, setBusyTagId] = useState(null);
  const [tagQuery, setTagQuery] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [openSections, setOpenSections] = useState({
    content: true,
    excerpt: false,
    cover: true,
    tags: true,
    publish: true,
  });

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const filteredTags = allTags.filter((t) =>
    t.name.toLowerCase().includes(tagQuery.trim().toLowerCase())
  );
  const [publishAt, setPublishAt] = useState(
    post?.publishedAt ? toLocalInput(post.publishedAt) : ""
  );
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

  const handleCreateTag = async (e) => {
    e?.preventDefault?.();
    const name = newTagName.trim();
    if (!name) return;
    setCreatingTag(true);
    setTagError(null);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to create tag");
      setAllTags((prev) => (prev.some((t) => t.id === data.id) ? prev : [...prev, data].sort((a, b) => a.name.localeCompare(b.name))));
      setSelectedTags((prev) => (prev.includes(data.id) ? prev : [...prev, data.id]));
      setNewTagName("");
    } catch (err) {
      setTagError(err.message || "Failed to create tag");
    } finally {
      setCreatingTag(false);
    }
  };

  const handleRenameTag = async (tagId) => {
    const name = editingName.trim();
    if (!name) return;
    setBusyTagId(tagId);
    setTagError(null);
    try {
      const res = await fetch("/api/admin/tags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tagId, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to rename tag");
      setAllTags((prev) => prev.map((t) => (t.id === tagId ? data : t)).sort((a, b) => a.name.localeCompare(b.name)));
      setEditingTagId(null);
      setEditingName("");
    } catch (err) {
      setTagError(err.message || "Failed to rename tag");
    } finally {
      setBusyTagId(null);
    }
  };

  const handleDeleteTag = async (tag) => {
    if (!window.confirm(`Delete tag "${tag.name}"? Posts keep their content, just lose this tag.`)) return;
    setBusyTagId(tag.id);
    setTagError(null);
    try {
      const res = await fetch(`/api/admin/tags?id=${tag.id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to delete tag");
      }
      setAllTags((prev) => prev.filter((t) => t.id !== tag.id));
      setSelectedTags((prev) => prev.filter((tagId) => tagId !== tag.id));
    } catch (err) {
      setTagError(err.message || "Failed to delete tag");
    } finally {
      setBusyTagId(null);
    }
  };

  const openPreview = async () => {
    if (!editor) return;
    setPreviewLoading(true);
    try {
      const html = await renderContentToHtml(editor.getJSON());
      setPreviewHtml(html);
      setPreviewOpen(true);
    } catch {
      setPreviewHtml(editor.getHTML());
      setPreviewOpen(true);
    } finally {
      setPreviewLoading(false);
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
      const scheduled = publishAt ? new Date(publishAt) : null;
      const validSchedule = scheduled && !Number.isNaN(scheduled.getTime()) ? scheduled.toISOString() : null;
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentJson, contentHtml, title, slug, excerpt, coverImage: finalCoverImage, status: newStatus, tags: selectedTags, publishedAt: newStatus === "PUBLISHED" ? validSchedule : undefined }),
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
      setPublishAt(post.publishedAt ? toLocalInput(post.publishedAt) : "");
    }
  }, [post]);

  useEffect(() => {
    setAllTags(tags || []);
  }, [tags]);

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
            <button type="button" className={`toolbar-btn${imageAttrs.align === "left" ? " active" : ""}`} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().updateAttributes("image", { align: "left" }).run()} title="Align left">◧</button>
            <button type="button" className={`toolbar-btn${(!imageAttrs.align || imageAttrs.align === "center") ? " active" : ""}`} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().updateAttributes("image", { align: "center" }).run()} title="Center">⬒</button>
            <button type="button" className={`toolbar-btn${imageAttrs.align === "right" ? " active" : ""}`} onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().updateAttributes("image", { align: "right" }).run()} title="Align right">◨</button>
            <label style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Size
              <input
                type="range"
                min={120}
                max={1000}
                step={10}
                value={Math.min(1000, Math.max(120, imageWidth))}
                onChange={(e) => editor.chain().updateAttributes("image", { width: String(e.target.value) }).run()}
                style={{ width: "140px" }}
              />
              <span style={{ minWidth: "52px", color: "var(--muted)" }}>{Math.min(1000, Math.max(120, imageWidth))}px</span>
            </label>
            <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().updateAttributes("image", { width: "320" }).run()} title="Small">S</button>
            <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().updateAttributes("image", { width: "640" }).run()} title="Medium">M</button>
            <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().updateAttributes("image", { width: "100%" }).run()} title="Full width">Full</button>
            <button type="button" className="toolbar-btn" onMouseDown={(e) => e.preventDefault()} onClick={() => editor.chain().deleteSelection().run()} title="Remove image">✕ Remove</button>
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
            <button className="btn btn-ghost" onClick={openPreview} disabled={isPublishing || previewLoading}>
              {previewLoading ? "Loading…" : "👁 Preview"}
            </button>
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
        <SidebarSection title="Title & Slug" open={openSections.content} onToggle={() => toggleSection("content")}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">Title</label>
            <input id="title" type="text" className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title" />
          </div>
          <div className="form-group">
            <label htmlFor="slug" className="form-label">Slug</label>
            <input id="slug" type="text" className="form-input" value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="auto-generated" />
            <p className="form-hint">Used in URL: /blog/<strong>{slug}</strong></p>
          </div>
        </SidebarSection>

        <SidebarSection title="Excerpt" badge={excerpt.trim() ? "· set" : "· empty"} open={openSections.excerpt} onToggle={() => toggleSection("excerpt")}>
          <div className="form-group">
            <textarea className="form-textarea" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short description for listings and SEO" rows={3} maxLength={160} />
            <p className="form-hint">{excerpt.trim().length}/160</p>
          </div>
        </SidebarSection>

        <SidebarSection title="Cover Image" badge={coverPreview ? "· set" : ""} open={openSections.cover} onToggle={() => toggleSection("cover")}>
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
        </SidebarSection>

        <SidebarSection title="Tags" badge={`${selectedTags.length}/${allTags.length}`} open={openSections.tags} onToggle={() => toggleSection("tags")}>
          {allTags.length > 5 && (
            <input
              type="search"
              className="form-input"
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
              placeholder="Filter tags…"
              style={{ marginBottom: "10px" }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "240px", overflowY: "auto", paddingRight: "4px" }}>
            {filteredTags.map((tag) => (
              <div key={tag.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label className={`tag-option ${selectedTags.includes(tag.id) ? "selected" : ""}`} style={{ flex: 1 }}>
                  <input type="checkbox" value={tag.id} checked={selectedTags.includes(tag.id)} onChange={(e) => setSelectedTags(e.target.checked ? [...selectedTags, tag.id] : selectedTags.filter((tagId) => tagId !== tag.id))} />
                  {editingTagId === tag.id ? (
                    <input
                      type="text"
                      value={editingName}
                      autoFocus
                      maxLength={40}
                      onChange={(e) => setEditingName(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ background: "transparent", border: 0, outline: "none", width: "110px", font: "inherit" }}
                    />
                  ) : (
                    tag.name
                  )}
                </label>
                {editingTagId === tag.id ? (
                  <>
                    <button type="button" className="btn btn-secondary" style={{ height: "28px", padding: "0 10px", fontSize: "12px" }} disabled={busyTagId === tag.id} onClick={() => handleRenameTag(tag.id)}>Save</button>
                    <button type="button" className="btn btn-ghost" style={{ height: "28px", padding: "0 10px", fontSize: "12px" }} onClick={() => { setEditingTagId(null); setEditingName(""); }}>✕</button>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn btn-ghost" style={{ height: "28px", padding: "0 10px", fontSize: "12px" }} title={`Rename ${tag.name}`} onClick={() => { setEditingTagId(tag.id); setEditingName(tag.name); }}>✎</button>
                    <button type="button" className="btn btn-ghost" style={{ height: "28px", padding: "0 10px", fontSize: "12px", color: "#ef4444" }} title={`Delete ${tag.name}`} disabled={busyTagId === tag.id} onClick={() => handleDeleteTag(tag)}>🗑</button>
                  </>
                )}
              </div>
            ))}
            {!filteredTags.length && <p className="form-hint">{allTags.length ? "No tags match." : "No tags yet — create the first one below."}</p>}
          </div>
          <form onSubmit={handleCreateTag} style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <input
              type="text"
              className="form-input"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="New tag name…"
              maxLength={40}
              disabled={creatingTag}
            />
            <button type="submit" className="btn btn-secondary" style={{ height: "40px", flex: "0 0 auto" }} disabled={creatingTag || !newTagName.trim()}>
              {creatingTag ? "…" : "Add"}
            </button>
          </form>
          {tagError && <p role="alert" style={{ color: "#ef4444", fontSize: "13px" }}>{tagError}</p>}
        </SidebarSection>

        <SidebarSection
          title="Publish"
          badge={status === "PUBLISHED" ? (publishAt && new Date(publishAt) > new Date() ? "· scheduled" : "· live") : "· draft"}
          open={openSections.publish}
          onToggle={() => toggleSection("publish")}
        >
          <div className="form-group">
            <label htmlFor="status" className="form-label">Status</label>
            <select id="status" className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="publishAt" className="form-label">Publish at</label>
            <input
              id="publishAt"
              type="datetime-local"
              className="form-input"
              value={publishAt}
              onChange={(e) => setPublishAt(e.target.value)}
            />
            <p className="form-hint">
              {publishAt && new Date(publishAt) > new Date()
                ? "Stays hidden until this time, then appears automatically."
                : "Empty = immediately."}
            </p>
            {publishAt && (
              <button type="button" className="btn btn-ghost" style={{ height: "32px", marginTop: "8px" }} onClick={() => setPublishAt("")}>
                Clear schedule
              </button>
            )}
          </div>
        </SidebarSection>

        {saveError && (
          <section className="sidebar-section" style={{ borderColor: "#ef4444", background: "rgba(239, 68, 68, 0.05)" }}>
            <p style={{ color: "#ef4444", fontSize: "13px", margin: 0 }}>{saveError}</p>
          </section>
        )}
      </aside>

      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Post preview"
          onClick={() => setPreviewOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.55)", display: "flex", justifyContent: "center", padding: "32px 16px", overflowY: "auto" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", maxWidth: "760px", width: "100%", height: "fit-content", overflow: "hidden" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--bg)" }}>
              <strong style={{ fontSize: "14px" }}>Preview — how readers will see it</strong>
              <div style={{ display: "flex", gap: "8px" }}>
                <button type="button" className="btn btn-secondary" style={{ height: "34px" }} onClick={() => setPreviewOpen(false)}>Close</button>
                <button
                  type="button"
                  className={`btn publish-btn ${status === "PUBLISHED" ? "published" : "draft"}`}
                  style={{ height: "34px" }}
                  disabled={isPublishing}
                  onClick={async () => { await handleSave("PUBLISHED"); setPreviewOpen(false); }}
                >
                  Publish
                </button>
              </div>
            </div>
            <div className="blog-page" style={{ padding: "32px 24px 48px" }}>
              <div className="col" style={{ maxWidth: "680px", margin: "0 auto" }}>
                <p style={{ fontSize: "12px", color: "var(--muted)", margin: "0 0 8px" }}>/blog/{slug || "…"}</p>
                <h1 className="blog-post-title">{title || "Untitled"}</h1>
                <div className="blog-post-meta" style={{ margin: "12px 0 20px" }}>
                  <span className="blog-card-date">{new Date().toLocaleDateString()}</span>
                  <div className="blog-card-tags">
                    {allTags.filter((t) => selectedTags.includes(t.id)).map((tag) => (
                      <span key={tag.id} className="blog-card-tag">{tag.name}</span>
                    ))}
                  </div>
                </div>
                {excerpt.trim() && <p style={{ fontSize: "16px", color: "var(--muted)", margin: "0 0 20px" }}>{excerpt}</p>}
                {(coverPreview || coverImage) && (
                  <img src={coverPreview || coverImage} alt="Cover preview" style={{ width: "100%", aspectRatio: "16/9", maxHeight: "320px", objectFit: "cover", borderRadius: "12px", marginBottom: "24px", display: "block" }} />
                )}
                <article className="blog-post-content" dangerouslySetInnerHTML={{ __html: previewHtml || "<p>Nothing to preview yet.</p>" }} />
              </div>
            </div>
          </div>
        </div>
      )}
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