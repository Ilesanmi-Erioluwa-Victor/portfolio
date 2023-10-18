'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

import { myAnimatedSquareVariants, linkVariants } from '../variants';
import { links, media } from '../links';
import Underline from './Underline';
import { linksI, mediaI } from '../types/types';

const Navigation = ({ toggled }: any) => {
  const [isBeingHovered, setIsBeingHovered] = useState<string | null>(null);
  const router = usePathname();

  const item = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  return (
    <motion.ul
      className={toggled ? 'absolute flex-col md:right-[-10px] right-[-15px_!important] top-[20px] md:top-[50px]' : ''}
      animate={
        toggled
          ? 'howItShouldLookLikeAtTheEnd'
          : 'howItShouldLookLikeAtTheStart'
      }
      initial={'howItShouldLookLikeAtTheStart'}
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
          whileHover={{ scale: 1.1 }}
          // animate={toggled ? 'visible' : 'hidden'}
          variants={item}
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

      <motion.h2
        className='py-[2rem] text-[#4831d4] opacity-30'
        variants={item}
      >
        SAY HELLO
      </motion.h2>

      <motion.li variants={item}>
        <Link
          href={'mailto:ericjay1452@gmail.com'}
          className='text-[#4831d4]'
        >
          hello@ericjay1452
        </Link>
      </motion.li>

      <motion.div
        className='pt-3'
        variants={item}
      >
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
      </motion.div>
    </motion.ul>
  );
};

export default Navigation;
