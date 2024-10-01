"use client";

import React from "react";
import Marquee from "react-fast-marquee";
import { skills_data } from "src/Data/SkillsData";
import Image from "next/image";

const Skills = () => {
  return (
    <section className="relative px-3 pb-[1rem] pt-[5rem] bg-[#f8f8f8fb] md:py-[calc(4vw_+_3rem)] text-[#4831d4]">
      <Marquee pauseOnHover={true}>
        {skills_data.map((data, index) => {
          return (
            <React.Fragment key={index}>
              <div className="effect relative mx-2 my-0 py-[4.5rem  h-[21.25rem] w-[17.0625rem] rounded-[1rem] cursor-pointer">
                <div className="w-full flex flex-col p-4 ">
                  <div
                    style={{
                      backgroundImage: `url(${data.img.src})`,

                      backgroundPosition: "top center",
                      backgroundRepeat: "no-repeat",
                      backgroundSize: "cover",
                    }}
                    className="absolute top-0 left-0 right-0 bottom-0 rounded-[1rem]"
                  />
                  <div className="absolute bottom-0 left-0 py-4 flex gap-4 w-full rounded-b-[1rem] px-4 bg-slate-200">
                    <div>
                      <span>{data.name}</span> |
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{data?.level}</span>
                      <span className="text-black">{data?.verify}</span>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </Marquee>
    </section>
  );
};

export default Skills;
