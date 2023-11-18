'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { roboto_mono } from '../fonts/fonts';

import { motion, useTransform, useScroll, circOut } from 'framer-motion';

import { Hamburger, Navigation } from '../components';
const Bar = () => {
  const path = usePathname();
  const [hamburgerOpen, setHamburgerOpen] = useState(false);
  const toggleHamburger = () => {
    setHamburgerOpen(!hamburgerOpen);
  };

  const { scrollYProgress } = useScroll();

  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const linkColor = useTransform(
    scrollProgress,
    [0, 0.2, 0.8, 1],
    ['#ccf381', '#1131ad', '#e3f542', '#f0f00a'],
    { ease: circOut }
  );

  return (
    <nav
      className={`flex items-center justify-between fixed z-[100] w-[100%] px-[calc(4vw_+_1rem)] py-6 ${
        path === '/work' ? 'bg-white' : ''
      }`}
    >
      <Link href='/'>
        <motion.span
          className={`${roboto_mono.className} text-[3rem] font-bold`}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          style={{ color: linkColor, opacity: 1 }}
        >
          I.E
        </motion.span>
      </Link>
      <section>
        <div
          onClick={toggleHamburger}
          className='cursor-pointer'
        >
          <Hamburger toggled={hamburgerOpen} />
        </div>
        <Navigation toggled={hamburgerOpen} />
      </section>
    </nav>
  );
};

export default Bar;
