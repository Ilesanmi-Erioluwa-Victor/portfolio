'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { motion,  useInView } from 'framer-motion';
// import { roboto_mono, overpass } from '../fonts/fonts';
import Me from '../assets/images/myself.jpg';

const Header = () => {
  const ref = useRef(null);
  const isInView = useInView(ref);

  useEffect(() => {
    console.log('Element is in view: ', isInView);
  }, [isInView]);
  console.log(isInView);
  //   const { scrollYProgress } = useScroll();

  //  const controls = useAnimation();

  //  // Create a custom animation effect
  //  const animateImage = async (shouldAnimate) => {
  //    if (shouldAnimate) {
  //      // Animate the image to the smaller size and move it to the left
  //      await controls.start({ scale: 0.5, x: -100 });
  //    } else {
  //      // Animate the image back to its original size and position
  //      await controls.start({ scale: 1, x: 0 });
  //    }
  //  };

  //  const currentScrollProgress = scrollYProgress.get();

  //   useEffect(() => {
  //     animateImage(currentScrollProgress < 0.2);
  //   }, []);

  return (
    <header
      ref={ref}
      className='bg-[linear-gradient(90deg,#4831d4_67%,_#4831d4_33%)] lg:bg-[linear-gradient(90deg,#4831d4_67%,_#ccf381_33%)] py-[calc(4vw_+_3rem)] px-[calc(4vw_+_3rem)] flex relative flex-col'
    >
      <section className='mt-[calc(4vw_+_1rem)] flex items-center justify-between gap-[2rem] relative'>
        <article className='w-full md:w-full lg:w-[50%]'>
          <h2
            className={`$text-[3.2rem] text-white lg:text-[#ccf381]`}
          >
            Full Stack <br /> Typescript <br />
            Developer<span className='text-white lg:text-[#ccf381]'>.</span>
          </h2>

          <p
            className={` text-white lg:text-[#ccf381]`}
          >
            I like to craft solid and scalable frontend <br /> products with
            great user experiences.
          </p>

          <div className='pt-[calc(4vw_+_3rem)] flex gap-[2rem] flex-col md:flex-row md:items-center justify-between text-white lg:text-[#ccf381]'>
            <p>
              Highly skilled at progressive enhancement, design systems & UI
              Engineering
            </p>

            <p>
              Proven experience building successful products for clients across
              several countries.
            </p>
          </div>
        </article>

        <figure className='relative hidden lg:block'>
          <motion.div
            style={{
              // scale: isInView ? 1 : 0,
              transform: isInView ? 'translateX(-300px)' : 'translateX(-200px)',
              opacity: isInView ? 1 : 0,
              transition: 'all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) 0.5s',
            }}
          >
            <Image
              src={Me}
              alt='My photo'
              className='max-w-auto rounded-[50%] '
            />
          </motion.div>
        </figure>
      </section>
    </header>
  );
};

export default Header;
