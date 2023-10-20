'use client';
import { useRef } from 'react';

import Image from 'next/image';
import { overpass } from '../fonts/fonts';
import svg from '../assets/images/svg3.png';
import { motion, useInView } from 'framer-motion';
import { experience_Data } from '../Data/ExperienceData';

const Experience = () => {
  const ref = useRef(null);
  const isInView = useInView(ref);
  return (
    <div className='lg:px-[calc(4vw_+_3rem)] lg:py-[calc(4vh_+_3rem)] bg-[#4831d4]'>
      <article className='px-3 pb-[1rem] pt-[5rem] flex justify-between lg:items-center gap-5 lg:flex-row flex-col md:py-[calc(4vh_+_2.5rem)] md:px-[calc(4vw_+_2rem)] lg:py-0 lg:px-0 md:w-[80%] mx-auto lg:w-full'>
        <div className='w-full lg:w-[30%] flex flex-col gap-3'>
          <h2
            className={`${overpass.className} text-[3.5rem] lg:text-[4rem] font-semibold`}
          >
            Over the years,
          </h2>
          {experience_Data.map((data) => (
            <p key={data.id}>{data.para}</p>
          ))}
        </div>
        <motion.div
          className='hidden w-full md:block lg:w-[59%] bg-[#4831d4]'
          ref={ref}
          style={{
            transform: isInView ? 'translateX(0px)' : 'translateX(-200px)',
            opacity: isInView ? 1 : 0,
            transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s',
          }}
        >
          <Image
            src={svg}
            alt='svg'
            className='mx-auto max-w-full'
          />
        </motion.div>
      </article>
    </div>
  );
};

export default Experience;
