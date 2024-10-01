"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { poppins } from "../fonts/fonts";
import Me from "../assets/images/myself.jpg";
import { headerData } from "../Data/HeaderData";
import { useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

const Header = () => {
  useEffect(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });

    gsap.utils.toArray(".parallax").forEach((layer: any) => {
      const depth = layer.dataset.depth;
      const movement = -(layer.offsetHeight * depth);
      tl.to(layer, { y: movement, ease: "none" }, 0);
    });
  }, []);

  return (
    <header className="px-3 pb-[1rem] pt-[5rem] bg-[linear-gradient(90deg,#4831d4_67%,_#4831d4_33%)] lg:bg-[linear-gradient(90deg,#4831d4_67%,_#ccf381_33%)] md:py-[calc(4vh_+_3rem)] md:px-[calc(4vw_+_3rem)] flex relative flex-col">
      <section className="mt-[calc(4vw_+_1rem)] flex items-center justify-between gap-[2rem] relative">
        <article className="w-full md:w-full lg:w-[50%]">
          <h2
            className={`${poppins.className} text-[3.2rem] text-white lg:text-white font-bold`}
          >
            Full Stack <br /> Typescript <br />
            Developer<span className="text-white lg:text-[#ccf381]">.</span>
          </h2>

          <p
            className={`${poppins.className} text-white lg:text-white text-[1rem]`}
          >
            I like to craft solid and scalable frontend <br /> products with
            great user experiences.
          </p>

          <div className="pt-[calc(4vw_+_3rem)] flex gap-[2rem] flex-col md:flex-row md:items-center justify-between text-white lg:text-[#ccf381]">
            {headerData.map((data) => (
              <p
                key={data.id}
                className={`text-white ${poppins.className} text-[1rem]`}
              >
                {data.para}
              </p>
            ))}
          </div>
        </article>

        <figure className="absolute lg:right-[10%] hidden lg:block">
          <Image
            src={Me}
            alt="My photo"
            className="max-w-auto rounded-[50%] "
          />
        </figure>
      </section>
    </header>
  );
};

export default Header;
