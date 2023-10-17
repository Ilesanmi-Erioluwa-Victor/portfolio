import Link from "next/link";
import { IoChevronForwardSharp } from "react-icons/io5";

const News = () => {
  return (
    <section className="bg-[#f8f8f8fb] py-[calc(4vw_+_3rem)] px-[calc(4vw_+_3rem)] text-[#4831d4] ">
      <div className="bg-white rounded-sm shadow-sm flex justify-between items-center ">
        <article className="py-[calc(4vw_+_2.5rem)] px-[calc(4vw_+_2rem)] w-[50%]">
          <h2 className="text-[3rem] font-semibold leading-none">
            I build <br /> & design stuff
          </h2>
          <p className="text-[2rem] leading-none pt-2 pb-[4rem]">
            Open source <br />
            projects,web apps <br /> and experimental.
          </p>
          <Link
            href={"/work"}
            className="btn41-43 btn-43 justify-between items-center gap-4 rounded-sm"
          >
            {" "}
            <span>SEE MY WORK</span>
            <IoChevronForwardSharp />
          </Link>
        </article>

        <div className="h-[100vh] w-[2px] bg-[#4831d4] opacity-20"></div>

        <article className="py-[calc(4vw_+_2.5rem)] px-[calc(4vw_+_2rem)] w-[50%]">
          <h2 className="text-[3rem] font-semibold leading-none">
            I write,
            <br /> sometimes
          </h2>
          <p className="text-[2rem] leading-none pt-2 pb-[4rem]">
            About design,
            <br /> frontend dev,
            <br /> learning and life.
          </p>
          <Link
            href={"/work"}
            className="btn41-44 btn-42 justify-between items-center gap-4 rounded-sm"
          >
            {" "}
            <span>SEE MY WORK</span>
            <IoChevronForwardSharp />
          </Link>
        </article>
      </div>
    </section>
  );
};

export default News;
