"use client";
import { useEffect, useRef, useState } from "react";

const KEYS = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];

export default function Loader() {
  const [phase, setPhase] = useState("loading");
  const [visibleChars, setVisibleChars] = useState(0);
  const [percent, setPercent] = useState(0);
  const name = "ilesanmi";
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (phase !== "loading") return;

    document.body.classList.add("loading");
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo({ top: 0, behavior: "instant" });

    const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const MIN = REDUCED ? 200 : 1600;

    let loaded = document.readyState === "complete";
    const markReady = () => { loaded = true; };

    window.addEventListener("load", markReady);
    document.fonts?.ready?.then(markReady);
    const t1 = setTimeout(markReady, document.readyState === "loading" ? 500 : 250);
    const t2 = setTimeout(markReady, 4000);

    let t0 = performance.now();
    let rafId;

    const tick = (now) => {
      if (!mountedRef.current) return;
      const t = Math.min(1, (now - t0) / MIN);
      const eased = 1 - Math.pow(1 - t, 3);
      let target = Math.round(eased * 100);
      if (!loaded) target = Math.min(target, 99);
      setPercent(target);
      if (target < 100) {
        rafId = requestAnimationFrame(tick);
      } else if (mountedRef.current) {
        setTimeout(() => { if (mountedRef.current) setPhase("revealing"); }, 250);
      }
    };

    rafId = requestAnimationFrame(tick);

    const stopScroll = (e) => {
      if (!mountedRef.current || phase !== "loading") return;
      if (e.type === "keydown" && !KEYS.includes(e.key)) return;
      e.preventDefault();
    };
    window.addEventListener("wheel", stopScroll, { passive: false });
    window.addEventListener("touchmove", stopScroll, { passive: false });
    window.addEventListener("keydown", stopScroll);

    const charInterval = REDUCED ? 30 : 80;
    const charTimers = [];
    for (let i = 0; i < name.length; i++) {
      charTimers.push(setTimeout(() => { if (mountedRef.current) setVisibleChars(i + 1); }, 100 + i * charInterval));
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("load", markReady);
      clearTimeout(t1);
      clearTimeout(t2);
      charTimers.forEach(clearTimeout);
      window.removeEventListener("wheel", stopScroll);
      window.removeEventListener("touchmove", stopScroll);
      window.removeEventListener("keydown", stopScroll);
      document.body.classList.remove("loading");
    };
  }, [phase]);

  useEffect(() => {
    if (phase !== "revealing") return;
    document.body.classList.add("revealed");
    const t1 = setTimeout(() => {
      if (mountedRef.current) {
        document.body.classList.add("settled");
        setPhase("done");
      }
    }, 900);

    const t2 = setTimeout(() => {
      document.querySelectorAll(".hero > *").forEach((el, i) => {
        el.dataset.rise = "";
        el.style.setProperty("--rise-i", i);
        el.addEventListener("transitionend", () => el.classList.add("done"), { once: true });
      });
    }, 0);

    const heroItems = [...document.querySelectorAll(".hero > *")];
    const go = () => heroItems.forEach((el) => el.classList.add("lit"));
    const t3 = setTimeout(() => requestAnimationFrame(() => requestAnimationFrame(go)), 120);

    const sigHero = document.getElementById("sigHero");
    if (sigHero) {
      const t4 = setTimeout(() => sigHero.classList.add("draw"), 500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    }

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div className="loader" aria-hidden="true">
      <div className="loader-id">
        <span className="loader-name">
          {name.split("").map((char, i) => (
            <span
              key={i}
              className="loader-char"
              style={{
                opacity: i < visibleChars ? 1 : 0,
                transform: i < visibleChars ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.35s ease, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
                transitionDelay: "0s",
              }}
            >
              {char}
            </span>
          ))}
        </span>
      </div>
      <span className="loader-count txt">
        {percent}
      </span>
    </div>
  );
}