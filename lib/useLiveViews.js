import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export function readViewsCache() {
  try {
    return JSON.parse(sessionStorage.getItem("post-views") || "{}");
  } catch {
    return {};
  }
}

export function writeViewsCache(map) {
  try {
    sessionStorage.setItem("post-views", JSON.stringify({ ...readViewsCache(), ...map }));
  } catch {}
}

export function useLiveViews(posts) {
  const [liveViews, setLiveViews] = useState(() => readViewsCache());
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const fetchCounts = () => {
      Promise.all(
        (posts || []).map((p) =>
          fetch(`/api/views/${p.slug}`)
            .then((r) => (r.ok ? r.json() : null))
            .then((d) => (d && typeof d.views === "number" ? [p.slug, d.views] : null))
            .catch(() => null)
        )
      ).then((entries) => {
        if (cancelled) return;
        const map = {};
        for (const e of entries) if (e) map[e[0]] = e[1];
        if (!Object.keys(map).length) return;
        writeViewsCache(map);
        setLiveViews((prev) => ({ ...prev, ...map }));
      });
    };

    fetchCounts();
    router.events?.on("routeChangeComplete", fetchCounts);
    window.addEventListener("focus", fetchCounts);
    return () => {
      cancelled = true;
      router.events?.off("routeChangeComplete", fetchCounts);
      window.removeEventListener("focus", fetchCounts);
    };
  }, [posts, router]);

  return liveViews;
}
