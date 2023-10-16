import Link from "next/link";
import { overpass } from "src/fonts/fonts";

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
  return (
    <ul
      className={`${
        toggled ? "absolute" : "hidden"
      } top-0 right-1 w-[20rem] h-[400px] rounded-sm z-10 flex bg-white flex-col pt-[4rem]`}
    >
      {links.map((link) => (
        <li key={link.id} className="hover:bg-red-800">
          <Link
            href={link.href}
            title={link.title}
            className={`${overpass.className} p-2 block w-full text-sm`}
          >
            {link.title}
          </Link>
        </li>
      ))}

      <h2>Say hello to me</h2>
    </ul>
  );
};

export default Navigation;
