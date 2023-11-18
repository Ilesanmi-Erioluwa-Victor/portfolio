'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { media, links } from '../links';

const Footer = () => {
  const router = usePathname();
  return (
    <footer className='px-0 sm:px-[calc(4vw_+_3rem)] py-[calc(4vw_+_3rem)] bg-[#4831d4]'>
      <div className='py-[5rem] w-[85%] mx-auto lg:w-full flex lg:items-center lg:gap-[15rem] lg:flex-row justify-center lg:justify-start flex-col gap-4'>
        <ul className=''>
          <h3 className='text-lg font-semibold mb-4'>SAY HELLO</h3>
          {links.map((link) => (
            <li
              key={link.id}
              className={router === link.href ? 'hidden' : ''}
            >
              <Link
                href={link.href}
                className='py-2 block text-white'
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>

        <ul className=''>
          {links.map((link) => (
            <li
              key={link.id}
              className={router === link.href ? 'hidden' : ''}
            >
              <Link
                href={link.href}
                className='block py-2 text-white'
              >
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <span className='block w-full h-1 rounded-sm bg-[#ccf381]'></span>
      <section className='py-[4rem] flex justify-center lg:items-center flex-col-reverse  gap-4 lg:flex-row'>
        <span className='capitalize font-[500] text-sm lg:block w-[85%] mx-auto lg:w-full text-white'>
          <span>&copy; </span>
          {new Date().getFullYear()} Ilesanmi Erioluwa Victor.All Rights
          Reserved.
        </span>
        <ul className='flex  lg:items-center gap-4 lg:flex-row flex-col w-[85%] mx-auto lg:w-full '>
          {media.map((media) => (
            <li key={media.id}>
              <Link
                href={media.href}
                className='block text-white'
              >
                {media.title.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </footer>
  );
};

export default Footer;
