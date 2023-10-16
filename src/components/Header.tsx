"use client";

import { roboto_mono, overpass } from "src/fonts/fonts";

import Image from "next/image";
import Me from "src/assets/images/myself.jpg";
import Navigation from "./Navigation";

import { motion } from "framer-motion";
import HamburgerMenu from "./Hamburger";
import { useState } from "react";

const Header = () => {
  const [hamburgerOpen, setHamburgerOPen] = useState<boolean | null>(true);

  const toggleHamburger = () => {
    setHamburgerOPen(!hamburgerOpen);
    console.log(hamburgerOpen);
  };
  return (
    <header className="bg-[linear-gradient(90deg,#4831d4_67%,_#ccf381_33%)] p-[calc(4vw_+_1rem)] flex relative flex-col">
      <nav className="flex items-center justify-between fixed z-[100] w-[90%] p-4">
        <h2 className={roboto_mono.className}>I. E</h2>
        <section className="">
          <div onClick={toggleHamburger} className="cursor-pointer">
            <HamburgerMenu toggled={hamburgerOpen} />
          </div>

          <Navigation toggled={hamburgerOpen} />
        </section>
      </nav>

      <section className="mx-[calc(2vw_+_1rem)] mt-[calc(4vw_+_1rem)] flex items-center justify-between gap-[2rem] relative">
        <article className="w-[50%]">
          <h2 className={`${overpass.className} text-[3.2rem] text-[#ccf381]`}>
            Full Stack <br /> Typescript <br />
            Developer<span className="text-[#ccf381]">.</span>
          </h2>

          <p className={`${roboto_mono.className} text-[#ccf381]`}>
            I like to craft solid and scalable frontend <br /> products with great user experiences.
          </p>

          <div className="pt-[calc(4vw_+_3rem)] flex gap-[2rem] items-center justify-between text-[#ccf381]">
            <p>Highly skilled at progressive enhancement, design systems & UI Engineering</p>

            <p>
              Proven experience building successful products for clients across several countries.
            </p>
          </div>
        </article>

        <figure className="relative">
          <Image src={Me} alt="My photo" className="max-w-auto rounded-[50%] " />
        </figure>
      </section>
    </header>
  );
};

export default Header;
