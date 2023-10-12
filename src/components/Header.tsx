import { roboto_mono } from 'src/fonts/fonts';

const Header = () => {
  return (
    <header className='bg-[linear-gradient(90deg,#4831d4_67%,_#ccf381_33%)] p-[calc(4vw_+_1rem)] flex relative flex-col'>
      <nav className='flex items-center justify-between'>
        <h2 className={roboto_mono.className}>I. E</h2>

        <section>Hamburger</section>
      </nav>
    </header>
  );
};

export default Header;
