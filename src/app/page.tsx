'use client';

import { Header, Contact, Experience, News, Roles } from '../components';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import Image from 'next/image';

import Image4 from '../assets/images/myself.jpg';
import Image1 from '../assets/images/overlap.png';
import Image2 from '../assets/images/svg2.png';
import Image3 from '../assets/images/svg3.png';

export default function Home() {
  const images = [Image4, Image1, Image2, Image3];
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <>
      <Header />
      <Roles />
      <Experience />
      <News />
      <Contact />
    </>
  );
}
