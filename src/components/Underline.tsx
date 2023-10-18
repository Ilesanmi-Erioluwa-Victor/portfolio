'use client';

import { motion } from 'framer-motion';

const variants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

const Underline = () => {
  return (
    <motion.div
      className='absolute left-[-8rem] right-0 h-1 rounded-md bg-[linear-gradient(90deg,#4831d4_67%,_#ccf381_33%)] w-[30%] mx-auto'
      layoutId='underline'
      layout
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      variants={variants}
    ></motion.div>
  );
};

export default Underline;
