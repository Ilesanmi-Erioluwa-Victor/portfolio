'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import { myAnimatedSquareVariants, linkVariants } from 'src/variants';
import { overpass, inconsolata } from 'src/fonts/fonts';
import { links, media } from 'src/links';
import Underline from './Underline';
import { linksI, mediaI } from 'src/types/types';

const Navigation = ({ toggled }: any) => {
  const [isBeingHovered, setIsBeingHovered] = useState<string | null>(null);
  const router = usePathname();

  return (
    <motion.ul
      className={`${
        toggled ? 'absolute' : 'hidden'
      } right-1 top-0 rounded-sm z-10  bg-white flex flex-col pt-[5rem] pl-[3rem] w-[20rem] h-[450px]`}
      animate={
        toggled
          ? 'howItShouldLookLikeAtTheEnd'
          : ' howItShouldLookLikeAtTheStart'
      }
      initial={false}
      layout
      variants={myAnimatedSquareVariants}
    >
      {links.map((link: linksI) => (
        <motion.li
          key={link.id}
          initial={false}
          layout
          className={router === link.href ? 'hidden' : ''}
          onHoverStart={() => setIsBeingHovered(link.id)}
          onHoverEnd={() => setIsBeingHovered(null)}
          variants={linkVariants}
          animate={toggled ? 'visible' : 'hidden'}
        >
          <Link
            title={link.title}
            className='p-2 block w-full text-sm text-[#4831d4]'
            href={link.href}
          >
            {link.title}
            {toggled && link.id === isBeingHovered && <Underline />}
          </Link>
        </motion.li>
      ))}

      <motion.h2 className='py-[2rem] text-[#4831d4] opacity-30'>
        SAY HELLO
      </motion.h2>
      <motion.li>
        <Link
          href={'mailto:ericjay1452@gmail.com'}
          className='text-[#4831d4]'
        >
          hello@ericjay1452
        </Link>
      </motion.li>
      <div className='pt-3'>
        <ul className='flex justify-between items-center pr-4 pt-4'>
          {media.map((media: mediaI) => (
            <li key={media.id}>
              <Link
                href={media.href}
                title={media.tit}
                className='text-[#4831d4]'
              >
                {media.title.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </motion.ul>
  );
};

export default Navigation;
