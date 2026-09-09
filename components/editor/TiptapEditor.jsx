import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";

const lowlight = createLowlight(common);

export default function TiptapEditor({
  initialTitle,
  initialSlug,
  initialExcerpt,
  initialContent,
  initialCoverImage,
  initialStatus,
  onSave,
  onPublish,
  onUnpublish,
  postId,
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(initialCoverImage || null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: { class: "editor-image" },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "editor-link", target: "_blank", rel: "noopener noreferrer" },
      }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialContent,
    editable: true,
  });

  const { register, handleSubmit: rhfHandleSubmit, setValue, watch } = useForm({
    defaultValues: {
      title: initialTitle || "",
      slug: initialSlug || "",
      excerpt: initialExcerpt || "",
      status: initialStatus || "DRAFT",
      coverImage: initialCoverImage || "",
      tags: "",
    },
  });

  const title = watch("title");
  const slug = watch("slug");
  const status = watch("status");

  useEffect(() => {
    if (!slug && title) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", generated);
    }
  }, [title, slug, setValue]);

  const handleCoverChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be less than 5MB.");
      return;
    }

    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));

    try {
      const presignRes = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "cover",
          filename: file.name,
          contentType: file.type,
          postSlug: slug || "untitled",
        }),
      });
      const { uploadUrl, publicUrl } = await presignRes.json();
      if (!uploadUrl) throw new Error("Failed to get upload URL");
      await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      setValue("coverImage", publicUrl);
      setCoverPreview(publicUrl);
    } catch (err) {
      console.error("Cover upload failed:", err);
      setError("Failed to upload cover image");
    }
  };

  const onSaveHandler = async (data) => {
    if (!editor) return;
    setSaving(true);
    setError(null);

    try {
      const contentJson = editor.getJSON();
      const contentHtml = editor.getHTML();

      const payload = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        contentJson,
        contentHtml,
        coverImage: data.coverImage,
        status: data.status,
      };

      const url = postId
        ? `/api/admin/posts/${postId}`
        : "/api/admin/posts";
      const method = postId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }

      const post = await res.json();
      if (onSave) onSave(post);
      router.push(`/admin/posts/${post.id}`);
    } catch (err) {
      setError(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await onPublish(postId);
      router.push(`/admin/posts/${postId}`);
    } catch (err) {
      setError(err.message || "Failed to publish");
    } finally {
      setSaving(false);
    }
  };

  const handleUnpublish = async () => {
    setSaving(true);
    try {
      await onUnpublish(postId);
      router.push(`/admin/posts/${postId}`);
    } catch (err) {
      setError(err.message || "Failed to unpublish");
    } finally {
      setSaving(false);
    }
  };

  if (!editor) return <div>Loading editor...</div>;

  return (
    <div className="editor-page">
      <form onSubmit={rhfHandleSubmit(onSaveHandler)}>
        <header className="editor-header">
          <div className="editor-meta">
            <input
              {...register("title")}
              placeholder="Post title"
              className="title-input"
            />
            <input
              {...register("slug")}
              placeholder="URL slug (auto-generated)"
              className="slug-input"
              readOnly
            />
          </div>

          <div className="editor-toolbar">
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Heading 1">H1</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Heading 2">H2</button>
            <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading 3">H3</button>
            <div className="divider" />
            <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} title="Bold"><strong>B</strong></button>
            <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic"><em>I</em></button>
            <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} title="Strikethrough"><s>S</s></button>
            <button type="button" onClick={() => editor.chain().focus().toggleCode().run()} title="Inline code"><code>{`< >`}</code></button>
            <div className="divider" />
            <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">• List</button>
            <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">1. List</button>
            <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Code block">{`<{ }>`}</button>
            <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Blockquote">❝</button>
            <div className="divider" />
            <button type="button" onClick={() => { const href = prompt("URL:"); if (href) editor.chain().focus().setLink({ href }).run(); }} title="Add link">🔗</button>
            <button type="button" onClick={() => { const src = prompt("Image URL:"); if (src) editor.chain().focus().setImage({ src }).run(); }} title="Add image">🖼</button>
          </div>
        </header>

        <div className="editor-main">
          <div className="editor-content">
            <EditorContent editor={editor} />
          </div>

          <aside className="editor-sidebar">
            <div className="sidebar-section">
              <h3>Post settings</h3>
              <div className="field">
                <label>Excerpt</label>
                <textarea {...register("excerpt")} rows={3} placeholder="Brief summary for listings..." />
              </div>
              <div className="field">
                <label>Tags</label>
                <input {...register("tags")} placeholder="comma, separated, tags" />
              </div>
              <div className="field">
                <label>Cover image</label>
                {coverPreview && (
                  <img src={coverPreview} alt="Cover preview" style={{ maxWidth: "100%", borderRadius: 8 }} />
                )}
                <input type="file" accept="image/*" onChange={handleCoverChange} />
                {coverFile && <p>Uploaded: {coverFile.name}</p>}
              </div>
              <div className="field">
                <label>Status</label>
                <select {...register("status")}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="sidebar-actions">
              <button type="submit" disabled={saving} className="btn primary">
                {saving ? "Saving..." : "Save draft"}
              </button>
              {status === "PUBLISHED" ? (
                <button type="button" onClick={handleUnpublish} disabled={saving} className="btn secondary">
                  Unpublish
                </button>
              ) : (
                <button type="button" onClick={handlePublish} disabled={saving} className="btn success">
                  Publish
                </button>
              )}
              {error && <p className="error">{error}</p>}
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
