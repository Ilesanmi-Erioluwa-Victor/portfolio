import Image from "next/image";
import { Header } from "src/components";
import Contact from "src/components/Contact";
import Experience from "src/components/Experience";
import News from "src/components/News";
import Roles from "src/components/Roles";

export default function Home() {
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
