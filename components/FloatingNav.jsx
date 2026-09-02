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
      const wantFloating = next !== "docked";
      const wantHidden =
        next === "floating-hidden" || next === "armed-hidden";
      const wasFloating = prev !== "docked";

      if (wantHidden && !wasFloating) {
        nav.classList.add("snap");
        nav.classList.toggle("floating", true);
        col.classList.toggle("reserve", true);
        nav.classList.toggle("hide", true);
        void nav.offsetWidth;
        nav.classList.remove("snap");
      } else {
        nav.classList.toggle("floating", wantFloating);
        col.classList.toggle("reserve", wantFloating);
        nav.classList.toggle("hide", wantHidden);
      }

      if (next === "docked") {
        nav.classList.add("snap");
        void nav.offsetWidth;
        nav.classList.remove("snap");
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