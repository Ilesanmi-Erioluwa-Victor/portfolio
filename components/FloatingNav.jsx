"use client";
import { useEffect, useRef } from "react";

export default function FloatingNav() {
  const rafRef = useRef(null);
  const lastYRef = useRef(0);
  const gateRef = useRef(0);
  const stateRef = useRef("docked");

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

    const setState = (next) => {
      if (!nav.isConnected) return;
      if (stateRef.current === next) return;
      const prev = stateRef.current;
      stateRef.current = next;
      nav.classList.toggle("floating", next !== "docked");
      col.classList.toggle("reserve", next !== "docked");
      nav.classList.toggle(
        "hide",
        next === "floating-hidden" || next === "armed-hidden"
      );
      if (next === "docked" && prev !== "docked") {
        nav.classList.add("no-transition");
        void nav.offsetWidth;
        nav.classList.remove("no-transition");
      }
    };

    const update = () => {
      ticking = false;
      const y = window.scrollY;
      const delta = y - lastYRef.current;
      lastYRef.current = y;

      if (y <= gateRef.current) {
        setState("docked");
        return;
      }

      if (delta < 0) {
        setState("floating-shown");
        return;
      }

      if (stateRef.current === "floating-shown" && Math.abs(delta) < 4) return;

      if (stateRef.current === "floating-shown") {
        setState("armed-hidden");
        return;
      }

      if (stateRef.current === "armed-hidden") {
        return;
      }

      setState("floating-hidden");
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