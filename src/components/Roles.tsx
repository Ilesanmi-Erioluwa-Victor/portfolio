import { overpass } from 'src/fonts/fonts';

const Roles = () => {
  return (
    <div className='bg-[#f8f8f8fb] py-[calc(4vw_+_3rem)] px-[calc(4vw_+_3rem)] text-[#4831d4] flex flex-col gap-6 justify-center items-center'>
      <article className='flex justify-between items-center gap-5'>
        <div className='w-[41%]'>
          <h2 className={`${overpass.className} text-[4rem]`}>Design</h2>
          <p>
            I'm probably not the typical designer positioned behind an
            Illustrator artboard adjusting pixels, but I design. Immersed in
            stylesheets tweaking font sizes and contemplating layouts is where
            you'll find me (~_^). I'm committed to creating fluent user
            experiences while staying fashionable.
          </p>
        </div>
        <div className='w-[59%]'></div>
      </article>

      <article className='flex justify-between items-center gap-5 flex-row-reverse'>
        <div className='w-[41%]'>
          <h2 className={`${overpass.className} text-[4rem]`}>Engineering</h2>
          <p>
            In building JavaScript applications, I'm equipped with just the
            right tools, and can absolutely function independently of them to
            deliver fast, resilient solutions optimized for scale — performance
            and scalabilty are priorities on my radar.
          </p>
        </div>
        <div className='w-[59%]'></div>
      </article>
    </div>
  );
};

export default Roles;
