// right-9 top-[3rem] rounded-sm z-10  bg-white flex flex-col pt-[5rem] pl-[3rem] w-[20rem] h-[450px]

export const myAnimatedSquareVariants = {
  howItShouldLookLikeAtTheStart: {
    opacity: 0,
    display: 'none',
  },
  howItShouldLookLikeAtTheEnd: {
    opacity: 1,
    x: -50,
    display: 'flex',
    borderRadius: '10px',
    backgroundColor: '#fff',
    right: '-10px',
    paddingTop: '5rem',
    paddingLeft: '3rem',
    width: '20rem',
    height: '450px',
    transition: {
      delayChildren: 0.9,
      staggerDirection: -1,
    },
  },
};

export const linkVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
};
