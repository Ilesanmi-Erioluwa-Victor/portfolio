'use client';

import { useRef } from 'react';
import Image from 'next/image';
// import { overpass } from '../fonts/fonts';
import overlap from '../assets/images/overlap.png';
import { motion, useInView } from 'framer-motion';

const Roles = () => {
  const ref = useRef(null);
  const isInView = useInView(ref);

  return (
    <div className='bg-[#f8f8f8fb] py-[calc(4vw_+_3rem)] px-[calc(4vw_+_3rem)] text-[#4831d4] flex flex-col gap-[3rem] justify-center items-center'>
      <article className='flex justify-between items-center gap-5 relative z-10'>
        <div className='w-full lg:w-[41%]'>
          <h2
            className={` text-[3.5rem] lg:text-[4rem] font-semibold`}
          >
            Design
          </h2>
          <p>
            I'm probably not the typical designer positioned behind an
            Illustrator artboard adjusting pixels, but I design. Immersed in
            stylesheets tweaking font sizes and contemplating layouts is where
            you'll find me (~_^). I'm committed to creating fluent user
            experiences while staying fashionable.
          </p>
        </div>
        <div
          className='w-[59%] hidden lg:block'
          ref={ref}
        >
          <motion.figure
            className='w-[20rem] h-[20rem] relative '
            style={{
              // scale: isInView ? 1 : 0,
              transform: isInView ? 'translateX(0px)' : 'translateX(-200px)',
              opacity: isInView ? 1 : 0,
              transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s',
            }}
          >
            <Image
              src={overlap}
              alt='background overlap image'
              className='absolute rounded-[50%_50%_30%_70%_/_50%_50%_70%_30%] max-w-full z-[-1] right-[-100%] opacity-30'
            />
          </motion.figure>
        </div>
      </article>

      <article className='flex justify-between items-center gap-5 flex-row-reverse'>
        <div className='w-full lg:w-[41%] '>
          <h2
            className={` text-[3.5rem] lg:text-[4rem] font-semibold`}
          >
            Engineering
          </h2>
          <p>
            In building JavaScript applications, I'm equipped with just the
            right tools, and can absolutely function independently of them to
            deliver fast, resilient solutions optimized for scale — performance
            and scalabilty are priorities on my radar.
          </p>
        </div>
        <div className='w-[59%] hidden lg:block'>
          <motion.figure
            ref={ref}
            className='w-[20rem] h-[20rem] relative'
            style={{
              // scale: isInView ? 1 : 0,
              transform: isInView ? 'translateX(0px)' : 'translateX(-200px)',
              opacity: isInView ? 1 : 0,
              transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s',
            }}
          >
            <Image
              src={overlap}
              alt='background overlap image'
              className='absolute rounded-[20%_30%_40%_50%_/_10%_20%_30%_40%] max-w-full opacity-40'
            />
          </motion.figure>
        </div>
      </article>

      <article className='flex justify-between items-center gap-5'>
        <div className='w-full lg:w-[41%]'>
          <h2
            className={` text-[3.5rem] lg:text-[4rem] font-semibold`}
          >
            Database Modelling
          </h2>
          <p>
            I'm probably not the typical designer positioned behind an
            Illustrator artboard adjusting pixels, but I design. Immersed in
            stylesheets tweaking font sizes and contemplating layouts is where
            you'll find me (~_^). I'm committed to creating fluent user
            experiences while staying fashionable.
          </p>
        </div>
        <div className='hidden lg:block w-[59%]'>
          <figure
            className='w-[20rem] h-[20rem] relative'
            ref={ref}
            style={{
              // scale: isInView ? 1 : 0,
              transform: isInView ? 'translateX(0px)' : 'translateX(-200px)',
              opacity: isInView ? 1 : 0,
              transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s',
            }}
          >
            <Image
              src={overlap}
              alt='background overlap image'
              className='absolute rounded-[50%_45%_55%_50%_/_40%_60%_40%_60%] max-w-full right-[-100%] opacity-40'
            />
          </figure>
        </div>
      </article>

      <article className='flex justify-between items-center gap-5 flex-row-reverse'>
        <div className='w-full lg:w-[41%]'>
          <h2
            className={` text-[3.5rem] lg:text-[4rem] font-semibold`}
          >
            Database Engineering
          </h2>
          <p>
            In building JavaScript applications, I'm equipped with just the
            right tools, and can absolutely function independently of them to
            deliver fast, resilient solutions optimized for scale — performance
            and scalability are priorities on my radar.
          </p>
        </div>
        <div className='hidden lg:block w-[59%]'>
          <figure
            className='w-[20rem] h-[20rem] relative'
            ref={ref}
            style={{
              // scale: isInView ? 1 : 0,
              transform: isInView ? 'translateX(0px)' : 'translateX(-200px)',
              opacity: isInView ? 1 : 0,
              transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s',
            }}
          >
            <Image
              src={overlap}
              alt='background overlap image'
              className='absolute rounded-[50%_60%_70%_40%_/_70%_60%_50%_40%] max-w-full opacity-40'
            />
          </figure>
        </div>
      </article>
    </div>
  );
};

export default Roles;
