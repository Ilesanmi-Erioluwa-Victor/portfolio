'use client';

import {
  Header,
  Contact,
  Experience,
  News,
  Roles,
  Skills,
} from '../components';

export default function Home() {
  return (
    <>
      <Header />
      <Roles />
      <Experience />
      <Skills />
      <News />
      <Contact />
    </>
  );
}
