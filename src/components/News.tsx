import Link from 'next/link';
import { IoChevronForwardSharp } from 'react-icons/io5';

const News = () => {
  return (
    <section className='bg-[#f8f8f8fb]  lg:py-[calc(4vw_+_3rem)] lg:px-[calc(4vw_+_3rem)] text-[#4831d4] '>
      <div className='bg-white rounded-sm shadow-sm flex flex-col lg:flex-row justify-between items-center '>
        <article className='py-[calc(4vw_+_2.5rem)] px-[calc(4vw_+_2rem)] w-[80%] lg:[50%]'>
          <h2 className='text-[3.5rem] font-semibold leading-none lg:text-[3rem] leading-0'>
            I build <br className='hidden lg:block' /> & design stuff
          </h2>
          <p className='text-[2rem] leading-none pt-2 pb-[4rem] mt-4'>
            Open source <br className='hidden lg:block' />
            projects,web apps <br className='hidden lg:block' /> and
            experimental.
          </p>
          <Link
            href={'/work'}
            className='btn41-43 btn-43 justify-between items-center gap-4 rounded-sm w-[50%_!important] lg:w-[100%_!important]'
          >
            {' '}
            <span>SEE MY WORK</span>
            <IoChevronForwardSharp />
          </Link>
        </article>

        <div className='lg:h-[100vh] lg:w-[2px] bg-[#4831d4] opacity-20 w-full h-[2px]'></div>

        <article className='py-[calc(4vw_+_2.5rem)] px-[calc(4vw_+_2rem)] w-[80%] lg:[50%]'>
          <h2 className='text-[3.5rem] font-semibold leading-none lg:text-[3rem] '>
            I write,
            <br className='hidden lg:block' /> sometimes
          </h2>
          <p className='text-[2rem] leading-none pt-2 pb-[4rem] mt-4'>
            About design,
            <br className='hidden lg:block' /> frontend dev,
            <br className='hidden lg:block' /> learning and life.
          </p>
          <Link
            href={'/work'}
            className='btn41-44 btn-42 justify-between items-center gap-4 rounded-sm w-[50%_!important] lg:w-[100%_!important]'
          >
            {' '}
            <span>SEE MY WORK</span>
            <IoChevronForwardSharp />
          </Link>
        </article>
      </div>
    </section>
  );
};

export default News;
