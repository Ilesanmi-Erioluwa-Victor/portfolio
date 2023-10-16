import Link from "next/link";
import { overpass, inconsolata } from "src/fonts/fonts";

const Navigation = ({ toggled }: any) => {
  const links = [
    {
      title: "Home",
      href: "/",
      id: "home",
    },

    {
      title: "My Work",
      href: "/work",
      id: "work",
    },

    {
      title: "My Articles",
      href: "/blog",
      id: "blog",
    },

    {
      title: "My Resume",
      href: "/resume",
      id: "resume",
    },
  ];

  const media = [
    { title: "tw", href: "/", tit: "Twitter", id: "twitter" },

    { title: "dv", href: "/", tit: "Devto", id: "devto" },

    { title: "ln", href: "/", tit: "Linkedin", id: "linkedin" },
    { title: "gh", href: "/", tit: "Github", id: "github" },
  ];
  return (
    <ul
      className={`${
        toggled ? "absolute" : "hidden"
      } top-0 right-1 w-[20rem] h-[450px] rounded-sm z-10 flex bg-white flex-col pt-[5rem] pl-[3rem]`}
    >
      {links.map((link) => (
        <li key={link.id}>
          <Link
            href={link.href}
            title={link.title}
            className={` p-2 block w-full text-sm text-[#4831d4]`}
          >
            {link.title}
          </Link>
        </li>
      ))}

      <h2 className="py-[2rem] text-[#4831d4] opacity-30">SAY HELLO</h2>

      <li>
        <Link href={"mailto:ericjay1452@gmail.com"} className="text-[#4831d4]">
          hello@ericjay1452
        </Link>
      </li>

      <div className="pt-3">
        <ul className="flex justify-between items-center pr-4 pt-4">
          {media.map((media) => (
            <li key={media.id}>
              <Link href={media.href} title={media.tit} className="text-[#4831d4]">
                {media.title.toUpperCase()}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </ul>
  );
};

export default Navigation;
