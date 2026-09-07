import { revalidatePath } from "next/cache";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { path, secret } = req.body;

  if (secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ error: "Invalid secret" });
  }

  if (!path) {
    return res.status(400).json({ error: "Path is required" });
  }

  try {
    revalidatePath(path);
    return res.json({ revalidated: true, path });
  } catch (err) {
    console.error("Revalidate error:", err);
    return res.status(500).json({ error: "Failed to revalidate" });
  }
}