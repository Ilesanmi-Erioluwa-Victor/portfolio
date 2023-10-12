import Link from 'next/link';
import Image from 'next/image';

import Notfound from 'src/assets/images/not-found.svg';

export default function NotFound() {
  return (
    <div className='min-h-[100vh] text-center flex items-center justify-center'>
      <div>
        <Image
          src={Notfound}
          alt='404 image'
          className='w-[90vw] max-w-[600px] block mb-[2rem] mt-[-3rem]'
        />
        <h3 className='text-[2rem]'>Ohh page not found</h3>
        <p className='mb-[2rem] text-lg'>
          We cant seem to find the page you are looking for
        </p>
        <Link
          href='/'
          className='notfoundbtn'
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}
