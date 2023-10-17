export const myAnimatedSquareVariants = {
  howItShouldLookLikeAtTheStart: {
    opacity: 0,
    x: 40,
  },
  howItShouldLookLikeAtTheEnd: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.5,
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
