import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/db";

export default function AdminNewPost({ session }) {
  return (
    <div className="admin-new-post">
      <h1>Create new post</h1>
      <p>Start writing a new blog post. You can save it as a draft and publish later.</p>

      <form className="new-post-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            id="title"
            type="text"
            className="form-input"
            placeholder="Enter post title"
            required
            autoFocus
            ref={titleRef}
          />
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "48px", fontSize: "15px" }}>
          Create post
        </button>
      </form>
    </div>
  );
}

import { useState, useRef } from "react";
import { useRouter } from "next/router";

function handleSubmit(e) {
  e.preventDefault();
  const title = titleRef.current.value.trim();
  if (!title) return;

  fetch("/api/admin/posts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, status: "DRAFT" }),
  })
    .then((res) => res.json())
    .then((post) => {
      router.push(`/admin/posts/${post.id}`);
    })
    .catch(() => alert("Failed to create post"));
}

export async function getServerSideProps(context) {
  const session = await getServerSession(context.req, context.res, authOptions);

  if (!session) {
    return {
      redirect: { destination: "/admin/login", permanent: false },
    };
  }

  return { props: { session } };
}