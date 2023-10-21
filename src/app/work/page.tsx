'use client';

import { usePathname } from 'next/navigation';
import { overpass } from '../../fonts/fonts';

const Work = () => {
  const pathname = usePathname();
  return (
    <section
      className={`${overpass.className} pt-[calc(4vw_+_5rem)] pb-[calc(4vw_+_3rem)] text-black`}
    >
      <main className='text-center pt-[calc(4vw_+_3rem)]'>
        <h2 className=' text-[2rem] font-bold '>{pathname.toUpperCase()}.</h2>
        <p className='text-lg '>
          collections of projects i have worked on and created in the past.
        </p>
      </main>

      <section className='px-[calc(4vw_+_3rem)] mt-[4rem]'>Hell from project</section>
    </section>
  );
};

export default Work;
