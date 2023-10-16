import { roboto_mono, overpass } from 'src/fonts/fonts';

import Image from 'next/image';
import Me from 'src/assets/images/myself.jpg';
import Navigation from './Navigation';

import { motion } from 'framer-motion';

const Header = () => {
  return (
    <header className='bg-[linear-gradient(90deg,#4831d4_67%,_#ccf381_33%)] p-[calc(4vw_+_1rem)] flex relative flex-col'>
      <nav className='flex items-center justify-between'>
        <h2 className={roboto_mono.className}>I. E</h2>
        <section>
          <Navigation />
        </section>
      </nav>

      <section className='mx-[calc(2vw_+_1rem)] mt-[calc(4vw_+_1rem)] flex items-center justify-between gap-[2rem] relative'>
        <article className='w-[50%]'>
          <h2 className={`${overpass.className} text-[3.2rem]`}>
            Full Stack <br /> Typescript <br />
            Developer<span className='text-[#ccf381]'>.</span>
          </h2>

          <p className={`${roboto_mono.className}`}>
            I like to craft solid and scalable frontend <br /> products with
            great user experiences.
          </p>

          <div className='pt-[calc(4vw_+_3rem)] flex gap-[2rem] items-center justify-between'>
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

        <figure className='relative w-[350px]'>
          <Image
            src={Me}
            alt='My photo'
            className='w-auto max-w-auto rounded-[50%] '
          />
        </figure>
      </section>
    </header>
  );
};

export default Header;
