import { overpass } from "src/fonts/fonts";
import svg from "src/assets/images/svg3.png";
import Image from "next/image";

const Experience = () => {
  return (
    <div className="px-[calc(4vw_+_3rem)] py-[calc(4vw_+_3rem)] bg-[#4831d4]">
      <article className="flex justify-between items-center gap-5">
        <div className="w-[30%] flex flex-col gap-3">
          <h2 className={`${overpass.className} text-[4rem] font-black`}>Over the years,</h2>
          <p>
            I've built products for companies and businesses around the globe ranging from marketing
            websites to complex solutions and enterprise apps with focus on fast, elegant and
            accessible user experiences.
          </p>
          <p>
            Currently, I work at Shopify as a Senior Frontend Engineer crafting thoughtful and
            inclusive experiences that adhere to web standards for over 3 million merchants across
            the world.
          </p>
          <p>
            Before now, I was Principal Frontend Engineer at hellotax, where I worked on a suite of
            tools and services tailored towards automated VAT compliance for multi-channel sellers
            in Europe
          </p>
          <p>
            Prior to hellotax, I was Senior frontend engineering consultant with Pixel2HTML,
            building JavaScript applications and interfaces for orgs and individuals.
          </p>

          <p>
            I once also led the frontend team at Conectar, an e-learning startup through building
            multiple React applications into a single robust learning platform.
          </p>
        </div>
        <div className="w-[59%] bg-[#4831d4]">
          <Image src={svg} alt="svg" className="mx-auto max-w-[auto]" />
        </div>
      </article>
    </div>
  );
};

export default Experience;
