import Link from "next/link";

const Navigation = () => {
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
    <ul className="flex flex-wrap my-[20px] mx-0 py-0 px-[25px]">
      {links.map((link) => (
        <li key={link.id}>
          <Link href={link.href} title={link.title} className="pr-[10px]">
            {link.title}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default Navigation;
