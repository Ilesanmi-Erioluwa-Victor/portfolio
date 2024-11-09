import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { useState } from "react";
import {
  RiYoutubeLine,
  RiInstagramLine,
  RiFacebookLine,
  RiDribbbleLine,
  RiGithubLine,
  RiPinterestLine,
} from "react-icons/ri";

export const socialData = [
  { name: "YouTube", link: "https://youtube.com", Icon: RiYoutubeLine },
  { name: "Instagram", link: "https://instagram.com", Icon: RiInstagramLine },
  { name: "Facebook", link: "https://facebook.com", Icon: RiFacebookLine },
  { name: "Dribbble", link: "https://dribbble.com", Icon: RiDribbbleLine },
  { name: "Pinterest", link: "https://pinterest.com", Icon: RiPinterestLine },
  {
    name: "Github",
    link: "https://github.com/sanidhyy/modern-portfolio",
    Icon: RiGithubLine,
  },
];

const Socials = () => {
  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimation();

  const toggleAnimation = () => {
    setIsOpen(!isOpen);
    controls.start(isOpen ? "hidden" : "visible");
  };

  const containerVariants = {
    hidden: {
      transition: {
        staggerChildren: 0.2,
        staggerDirection: -1,
      },
    },
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const iconRadius = 60; // Set radius for even spacing around the button
  const iconVariants = {
    hidden: {
      opacity: 0,
      scale: 0,
      x: 0,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    visible: (i) => ({
      opacity: 1,
      scale: 1,
      x: iconRadius * Math.cos((i / socialData.length) * 2 * Math.PI),
      y: iconRadius * Math.sin((i / socialData.length) * 2 * Math.PI),
      transition: { type: "spring", stiffness: 300, damping: 20 },
    }),
  };

  return (
    <div className="relative flex items-center justify-center pr-12">
      <motion.button
        onClick={toggleAnimation}
        className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-2xl"
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
        whileHover={{ scale: 1.1 }}
      >
        +
      </motion.button>

      <motion.div
        className="absolute"
        initial="hidden"
        animate={controls}
        variants={containerVariants}
      >
        {socialData.map(({ name, link, Icon }, i) => (
          <motion.div
            key={name}
            custom={i}
            variants={iconVariants}
            className="absolute"
          >
            <Link
              href={link}
              title={name}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg"
            >
              <div className="bg-black p-2 rounded-full">
                <Icon className="text-white" aria-hidden="true" />
              </div>
              <span className="sr-only">{name}</span>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default Socials;
