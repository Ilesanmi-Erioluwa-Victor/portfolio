'use client';

import { usePathname } from 'next/navigation';
import { overpass } from '../../fonts/fonts';
import Link from 'next/link';
import Image from 'next/image';

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

      <section className='px-[calc(4vw_+_3rem)] mt-[4rem]'>
        <div className='grid grid-cols-[repeat(auto-fit,minmax(200px,_1fr))] gap-[1rem]'>
          <section className='bg-[#f8f8f8] rounded-lg'>
            <Link href={'//'} className='block '>
              <figure>
                <Image
                  src=''
                  alt='prohect'
                />
              </figure>
              <span>Project Name</span>
            </Link>
            <article className='bg-white p-[2rem]'>
              <h3>Project</h3>
              <p>project url</p>
            </article>
          </section>

          <article className='bg-white p-[2rem]'>
            <h3>Project</h3>
            <p>project url</p>
          </article>

          <article className='bg-white p-[2rem]'>
            <h3>Project</h3>
            <p>project url</p>
          </article>
        </div>
      </section>
    </section>
  );
};

export default Work;
