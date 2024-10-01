"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import { gsap, SteppedEase, Back } from "gsap";
import "../styles/Notfound.css";


import Notfound from "../assets/images/not-found.svg";

export default function NotFound() {
  const copyContainerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const $copyContainer = copyContainerRef.current;
    const $handle = handleRef.current;

    if (!$copyContainer || !$handle) return; // Ensure refs are not null

    // Manually splitting text into characters (alternative to SplitText)
    const text = $copyContainer.querySelector("p")?.innerText || "";
    const characters = text
      .split("")
      .map(
        (char, index) =>
          `<span class="char">${char === " " ? "&nbsp;" : char}</span>`
      )
      .join("");

    if ($copyContainer.querySelector("p")) {
      $copyContainer.querySelector("p")!.innerHTML = characters;
    }

    const splitTextTimeline = gsap.timeline();
    const handleTL = gsap.timeline();
    const copyWidth = $copyContainer.querySelector("p")?.offsetWidth || 0;

    const animateCopy = () => {
      gsap.fromTo(
        ".char",
        { autoAlpha: 0 },
        {
          autoAlpha: 1,
          stagger: 0.05,
          ease: Back.easeInOut.config(1.7),
          onComplete: animateHandle,
        }
      );
    };

    const blinkHandle = () => {
      handleTL.fromTo(
        $handle,
        0.4,
        { autoAlpha: 0 },
        { autoAlpha: 1, repeat: -1, yoyo: true }
      );
    };


    const animateHandle = () => {
      handleTL.to($handle, 0.7, { x: copyWidth, ease: SteppedEase.config(12) });
    };

    gsap.delayedCall(0.2, () => {
      animateCopy();
      blinkHandle();
    });

    return () => {
      splitTextTimeline.kill();
      handleTL.kill();
    };
  }, []);

  return (
    // <div className="min-h-[100vh] text-center flex items-center justify-center">
    //   <div>
    //     <Image
    //       src={Notfound}
    //       alt="404 image"
    //       className="w-[90vw] max-w-[600px] block mb-[2rem] mt-[-3rem]"
    //     />
    //     <h3 className="text-[2rem]">Ohh page not found</h3>
    //     <p className="mb-[2rem] text-lg">
    //       We cant seem to find the page you are looking for
    //     </p>
    //     <Link href="/" className="notfoundbtn">
    //       Back Home
    //     </Link>
    //   </div>
    // </div>

    <div className="w-full h-[100vh]">
      <div className="copy-container center-xy" ref={copyContainerRef}>
        <p>404, page not found. please</p>
        <span className="handle" ref={handleRef}></span>
      </div>
      <svg
        id="cb-replay"
        viewBox="0 0 20 20"
        onClick={() => window.location.reload()}
      >
        <circle
          cx="10"
          cy="10"
          r="9"
          stroke="gray"
          strokeWidth="1"
          fill="none"
        />
        <polygon points="7,5 15,10 7,15" fill="gray" />
      </svg>
    </div>
  );
}
