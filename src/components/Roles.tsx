import Image from 'next/image';
import { overpass, poppins } from '../fonts/fonts';
import { RoleData } from '../Data/RoleData';
import bgI from '../assets/images/blob-scene-haikei.svg';

const Roles = () => {
  return (
    <div className='relative px-3 pb-[1rem] pt-[5rem] bg-[#f8f8f8fb] md:py-[calc(4vw_+_3rem)] md:px-[calc(4vw_+_3rem)] text-[#4831d4] flex flex-col gap-[3rem] justify-center items-center'>
      {RoleData.map((data) => (
        <article
          className={`flex justify-between items-center gap-5 relative ${
            data?.id % 2 === 0 && 'flex-row-reverse'
          }`}
          key={data.id}
        >
          <div className='w-full lg:w-[41%]'>
            <h2
              className={`${overpass.className} text-[2rem] lg:text-[3rem] font-semibold`}
            >
              {data.title}
            </h2>
            <p className={`${poppins.className} leading-[1.5rem]`}>
              {data.para}
            </p>
          </div>

          <div className='w-[59%] hidden lg:block'>
            <figure
              className={`w-full h-[20rem] relative `}
              style={{
                backgroundImage: `url(${data.img.src})`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                marginLeft: `${
                  data.id === 1 ? '7rem' : data.id === 2 ? '-12rem' : ''
                }`,
              }}
            >
              {/* <Image
                src={data.img}
                alt={data.title}
                className={`absolute max-w-full  opacity-30
                ${data.id % 2 === 1 && 'right-[-100%]'}  
                 `}
              /> */}
            </figure>
          </div>
        </article>
      ))}
    </div>
  );
};

export default Roles;
