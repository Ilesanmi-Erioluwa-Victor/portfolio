'use client';
import { useRef } from 'react';

import Image from 'next/image';
import { overpass } from '../fonts/fonts';
import svg from '../assets/images/svg3.png';
import { motion, useInView } from 'framer-motion';

const Experience = () => {
  const ref = useRef(null);
  const isInView = useInView(ref);
  return (
    <div className='lg:px-[calc(4vw_+_3rem)] lg:py-[calc(4vw_+_3rem)] bg-[#4831d4]'>
      <article className='flex justify-between lg:items-center gap-5 lg:flex-row flex-col py-[calc(4vh_+_0.5rem)] px-[calc(4vw_+_0.5rem)] md:py-[calc(4vh_+_2.5rem)] md:px-[calc(4vw_+_2rem)] lg:py-0 lg:px-0 w-[80%] mx-auto lg:w-full'>
        <div className='w-full lg:w-[30%] flex flex-col gap-3'>
          <h2
            className={`${overpass.className} text-[3.5rem] lg:text-[4rem] font-semibold`}
          >
            Over the years,
          </h2>
          <p>
            I've built products for companies and businesses around the globe
            ranging from marketing websites to complex solutions and enterprise
            apps with focus on fast, elegant and accessible user experiences.
          </p>
          <p>
            Currently, I work at Shopify as a Senior Frontend Engineer crafting
            thoughtful and inclusive experiences that adhere to web standards
            for over 3 million merchants across the world.
          </p>
          <p>
            Before now, I was Principal Frontend Engineer at hellotax, where I
            worked on a suite of tools and services tailored towards automated
            VAT compliance for multi-channel sellers in Europe
          </p>
          <p>
            Prior to hellotax, I was Senior frontend engineering consultant with
            Pixel2HTML, building JavaScript applications and interfaces for orgs
            and individuals.
          </p>

          <p>
            I once also led the frontend team at Conectar, an e-learning startup
            through building multiple React applications into a single robust
            learning platform.
          </p>
        </div>
        <motion.div
          className='hidden w-full md:block lg:w-[59%] bg-[#4831d4]'
          ref={ref}
          style={{
            // scale: isInView ? 1 : 0,
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
