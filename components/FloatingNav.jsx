"use client";
import { useEffect, useRef } from "react";

export default function FloatingNav() {
  const rafRef = useRef(null);
  const lastRef = useRef(0);

  useEffect(() => {
    const nav = document.querySelector(".col nav");
    if (!nav) return;
    const col = nav.parentElement;
    if (!col) return;

    const navH = nav.offsetHeight;
    const gate = nav.offsetTop + navH + 120;
    let ticking = false;

    const apply = (floating, visible) => {
      if (!nav.isConnected) return;
      nav.classList.toggle("floating", floating);
      col.classList.toggle("reserve", floating);
      nav.classList.toggle("hide", floating && !visible);
    };

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const delta = y - lastRef.current;
      if (Math.abs(delta) < 4) return;
      lastRef.current = y;
      if (y <= gate) {
        apply(false, false);
        return;
      }
      apply(true, delta < 0);
    };

    let scrollHandler = () => {
      if (ticking) return;
      ticking = true;
      rafRef.current = requestAnimationFrame(update);
    };

    addEventListener("scroll", scrollHandler, { passive: true });

    return () => {
      removeEventListener("scroll", scrollHandler);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (nav.isConnected) {
        nav.classList.remove("floating", "hide");
        col.classList.remove("reserve");
      }
    };
  }, []);

  return null;
}