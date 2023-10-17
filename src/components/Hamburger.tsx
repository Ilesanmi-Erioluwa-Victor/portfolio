'use client';
import {
  motion,
  useTransform,
  useScroll,
  circOut,
  useAnimation,
} from 'framer-motion';

const HamburgerMenu = ({ toggled }: any) => {
  const controls = useAnimation();

  const animateHamburger = async () => {
    if (toggled) {
      await controls.start({
        rotate: 0,
        scale: 1,
        transition: { duration: 0.5 },
      });

      await controls.start({
        rotate: 0,
        transition: { duration: 0.5 },
      });
    } else {
      await controls.start({
        rotate: 0,
        scale: 0.5,
        transition: { duration: 0.5 },
      });
    }
  };

  const { scrollYProgress } = useScroll();

  const scrollProgress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const linkColor = useTransform(
    scrollProgress,
    [0, 0.2, 0.8, 1],
    ['#1131ad', '#ccf381', '#e3f542', '#f0f00a'],
    { ease: circOut }
  );

  return (
    <motion.div
      initial={false}
      animate={controls}
      onClick={animateHamburger}
      className='w-[3rem] h-[2rem] flex items-center z-[100] flex-col py-1 justify-between relative my-4'
    >
      <motion.div
        className={`w-[3rem] h-[0.25rem] rounded-[10px] transition-all bg-[#4831d4] origin-[1px] ${
          toggled ? 'rotate-0' : 'rotate-0'
        }`}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ backgroundColor: linkColor, opacity: 1 }}
      ></motion.div>
      <motion.div
        className={`w-[2rem] h-[0.25rem] rounded-[10px] transition-all bg-[#4831d4] origin-[1px] ${
          toggled ? 'translate-x-[100%] opacity-0' : 'translate-x-0 opacity-100'
        }`}
        animate={{ opacity: toggled ? 0 : 1 }}
        transition={{ duration: 1 }}
        style={{ backgroundColor: linkColor, opacity: 0 }}
      ></motion.div>
      <motion.div
        className={`w-[3rem] h-[0.25rem] rounded-[10px] transition-all bg-[#4831d4] origin-[1px] ${
          toggled ? 'rotate-[-90deg]' : 'rotate-0'
        }`}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ backgroundColor: linkColor, opacity: 1 }}
      ></motion.div>
    </motion.div>
  );
};

export default HamburgerMenu;
