'use client';

import { roboto_mono } from 'src/fonts/fonts';
import { useState } from 'react';

import HamburgerMenu from 'src/components/Hamburger';
import Navigation from 'src/components/Navigation';

const Bar = () => {
  const [hamburgerOpen, setHamburgerOPen] = useState<boolean | null>(false);

  const toggleHamburger = () => {
    setHamburgerOPen(!hamburgerOpen);
  };
  return (
    <nav className='flex items-center justify-between fixed z-[100] w-[100%] p-[calc(4vw_+_1rem)] mx-auto'>
      <h2
        className={`${roboto_mono.className} text-[3rem] font-bold text-[#ccf381]`}
      >
        I.E
      </h2>
      <section className=''>
        <div
          onClick={toggleHamburger}
          className='cursor-pointer'
        >
          <HamburgerMenu toggled={hamburgerOpen} />
        </div>

        <Navigation toggled={hamburgerOpen} />
      </section>
    </nav>
  );
};

export default Bar;
