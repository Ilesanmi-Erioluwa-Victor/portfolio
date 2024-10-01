"use client";
import Link from "next/link";
import React, { useEffect, useRef } from "react";
import { gsap, SteppedEase, Back } from "gsap";

export default function NotFound() {
  const copyContainerRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const copyContainer = copyContainerRef.current;
    const handle = handleRef.current;

    if (!copyContainer || !handle) return;

    const text = copyContainer.querySelector("p")?.innerText || "";
    const characters = text
      .split("")
      .map(
        (char) => `<span class="char">${char === " " ? "&nbsp;" : char}</span>`
      )
      .join("");

    if (copyContainer.querySelector("p")) {
      copyContainer.querySelector("p")!.innerHTML = characters;
    }

    const splitTextTimeline = gsap.timeline();
    const handleTL = gsap.timeline();
    const copyWidth = copyContainer.querySelector("p")?.offsetWidth || 0;

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
        handle,
        { autoAlpha: 0 },
        { autoAlpha: 1, duration: 0.4, repeat: -1, yoyo: true }
      );
    };

    const animateHandle = () => {
      handleTL.to(handle, {
        x: copyWidth,
        duration: 0.7,
        ease: SteppedEase.config(12),
      });
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
    //
    //     <h3 className="text-[2rem]">Ohh page not found</h3>
    //     <p className="mb-[2rem] text-lg">
    //       We cant seem to find the page you are looking for
    //     </p>
    //     <Link href="/" className="notfoundbtn">
    //       Back Home
    //     </Link>
    //   </div>
    // </div>

    <div className="w-full h-[100vh] relative">
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
        ref={copyContainerRef}
      >
        <p className="text-black text-[24px] tracking-[0.2px] m-0">
          404, page not found. please go back Home
        </p>
        <span
          className="bg-[#ffe500] w-[14px] h-[30px] absolute top-0 left-0 mt-[1px]"
          ref={handleRef}
        ></span>
        <div className="relative mt-[30px]">
          <Link href="/" className="not_found_btn">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
