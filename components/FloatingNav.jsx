"use client";
import { useEffect, useRef } from "react";

export default function FloatingNav() {
  const rafRef = useRef(null);
  const lastYRef = useRef(0);
  const gateRef = useRef(0);
  const floatingRef = useRef(false);

  useEffect(() => {
    const nav = document.querySelector(".col nav");
    if (!nav) return;
    const col = nav.parentElement;
    if (!col) return;

    const measureGate = () => {
      const rect = nav.getBoundingClientRect();
      const y = window.scrollY;
      gateRef.current = y + rect.top + rect.height + 120;
    };

    measureGate();
    lastYRef.current = window.scrollY;

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
      const delta = y - lastYRef.current;
      lastYRef.current = y;

      if (y <= gateRef.current) {
        if (floatingRef.current) apply(false, false);
        return;
      }

      if (Math.abs(delta) < 4) return;
      apply(true, delta < 0);
    };

    let ticking = false;
    const scrollHandler = () => {
      if (ticking) return;
      ticking = true;
      rafRef.current = requestAnimationFrame(update);
    };

    const resizeHandler = () => {
      measureGate();
      scrollHandler();
    };

    addEventListener("scroll", scrollHandler, { passive: true });
    addEventListener("resize", resizeHandler, { passive: true });

    return () => {
      removeEventListener("scroll", scrollHandler);
      removeEventListener("resize", resizeHandler);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (nav.isConnected) {
        nav.classList.remove("floating", "hide");
        col.classList.remove("reserve");
      }
    };
  }, []);

  return null;
}