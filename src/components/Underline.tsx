import { motion } from 'framer-motion';

const Underline = () => {
  return (
    <motion.div
      className='absolute left-[-8rem] right-0 h-1 rounded-md bg-[linear-gradient(90deg,#4831d4_67%,_#ccf381_33%)] w-[30%] mx-auto'
      layoutId='underline'
      layout
      animate={{
        width: '40%',
        transition: {
          duration: 0.5,
        },
      }}
    ></motion.div>
  );
};

export default Underline;
