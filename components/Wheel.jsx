"use client";
import { useEffect, useRef } from "react";

// Simplified wheel with just 3 project cards repeated
const FRAMES = [
  { src: "AbS.png" },
  { src: "HelloBob.png" },
  { src: "Digiyo.png" },
];

const WHEEL_CONFIG = {
  gap: 60,
  slots: FRAMES.length,
  cardW: 238,
  cardH: 286,
  speed: 58,
};

export default function Wheel() {
  const discRef = useRef(null);
  const zoneRef = useRef(null);
  const hubRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined" || !discRef.current) return;

    const disc = discRef.current;
    const zone = zoneRef.current;
    const hub = hubRef.current;

    const SCALE = () =>
      Math.min(1, Math.max(0.55, (window.innerWidth - 120) / 1390));

    function solveWheel() {
      const s = SCALE();
      WHEEL_CONFIG.w = WHEEL_CONFIG.cardW * s;
      WHEEL_CONFIG.h = WHEEL_CONFIG.cardH * s;
      const half = Math.PI / WHEEL_CONFIG.slots;
      const footprint =
        WHEEL_CONFIG.w * Math.cos(half) + WHEEL_CONFIG.h * Math.sin(half);
      WHEEL_CONFIG.radius =
        (footprint + WHEEL_CONFIG.gap * s) / (2 * Math.sin(half));
      WHEEL_CONFIG.spinTime =
        (2 * Math.PI * WHEEL_CONFIG.radius) / (WHEEL_CONFIG.speed * s);
      return s;
    }
    solveWheel();

    function fitWheel() {
      const s = solveWheel();
      zone.style.height = 432 * s + "px";
      hub.style.top = 152 * s + WHEEL_CONFIG.radius + "px";
      disc.querySelectorAll(".card").forEach((card, i) => {
        card.style.width = WHEEL_CONFIG.w + "px";
        card.style.height = WHEEL_CONFIG.h + "px";
        card.style.transform =
          "rotate(" +
          (i / WHEEL_CONFIG.slots) * 360 +
          "deg) translateY(" +
          -WHEEL_CONFIG.radius +
          "px) translate(-50%, -50%)";
      });
    }

    const held = new Set();

    for (let i = 0; i < WHEEL_CONFIG.slots; i++) {
      const f = FRAMES[i % FRAMES.length];
      const angle = (i / WHEEL_CONFIG.slots) * 360;

      const card = document.createElement("div");
      card.className = "card";
      card.style.width = WHEEL_CONFIG.w + "px";
      card.style.height = WHEEL_CONFIG.h + "px";
      card.style.transform =
        "rotate(" +
        angle +
        "deg) translateY(" +
        -WHEEL_CONFIG.radius +
        "px) translate(-50%, -50%)";
      card.style.transformOrigin = "0 0";

      if (f.src) {
        const img = document.createElement("img");
        img.src = f.src;
        img.alt = "";
        img.loading = "lazy";
        card.appendChild(img);
      }

      const hoverable = () =>
        window.innerWidth > 640 && matchMedia("(hover: hover)").matches;
      card.addEventListener("pointerenter", (e) => {
        if (e.pointerType === "touch" || !hoverable()) return;
        held.add(card);
      });
      card.addEventListener("pointerleave", () => held.delete(card));

      disc.appendChild(card);
    }

    fitWheel();
    addEventListener("resize", () => {
      fitWheel();
      if (window.innerWidth <= 640) held.clear();
    });

    const REDUCED = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const EASE = 0.28;
    let angle = 0,
      rate = 1,
      last = performance.now();

    function turn(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const wanted = held.size ? 0 : 1;
      rate += (wanted - rate) * (1 - Math.exp(-dt / EASE));
      angle -= (360 / WHEEL_CONFIG.spinTime) * dt * rate;
      disc.style.transform = "rotate(" + angle + "deg)";
      requestAnimationFrame(turn);
    }
    if (!REDUCED) requestAnimationFrame(turn);
  }, []);

  return (
    <div className="wheel-zone" ref={zoneRef}>
      <div className="wheel" ref={hubRef}>
        <div className="disc" ref={discRef}></div>
      </div>
      <div className="wheel-fade"></div>
    </div>
  );
}
