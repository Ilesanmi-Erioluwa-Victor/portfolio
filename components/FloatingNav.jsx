"use client";
import { useEffect, useRef } from "react";

export default function FloatingNav() {
  const rafRef = useRef(null);
  const lastRef = useRef(0);
  const floatingRef = useRef(false);

  useEffect(() => {
    const nav = document.querySelector(".col nav");
    if (!nav) return;
    const col = nav.parentElement;
    if (!col) return;

    let ticking = false;

    const apply = (floating, visible) => {
      if (!nav.isConnected) return;
      nav.classList.toggle("floating", floating);
      col.classList.toggle("reserve", floating);
      nav.classList.toggle("hide", floating && !visible);
      floatingRef.current = floating;
    };

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const delta = y - lastRef.current;

      const rect = nav.getBoundingClientRect();
      const navH = rect.height || nav.offsetHeight;
      const navTopAbs = y + rect.top;
      const gate = navTopAbs + navH + 120;

      if (y <= gate) {
        if (floatingRef.current) apply(false, false);
        lastRef.current = y;
        return;
      }

      if (Math.abs(delta) < 4) return;
      lastRef.current = y;
      apply(true, delta < 0);
    };

    let scrollHandler = () => {
      if (ticking) return;
      ticking = true;
      rafRef.current = requestAnimationFrame(update);
    };

    addEventListener("scroll", scrollHandler, { passive: true });
    addEventListener("resize", scrollHandler, { passive: true });

    return () => {
      removeEventListener("scroll", scrollHandler);
      removeEventListener("resize", scrollHandler);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (nav.isConnected) {
        nav.classList.remove("floating", "hide");
        col.classList.remove("reserve");
      }
    };
  }, []);

  return null;
}