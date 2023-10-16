import Link from 'next/link';

const Navigation = () => {
  const links = [
    {
      href: '/',
      title: 'Home',
      id: 'Home',
    },

    {
      href: '/work',
      title: 'My Work',
      id: 'Work',
    },

    {
      href: '/blog',
      title: 'My Articles',
      id: 'blog',
    },

    {
      href: '/resume',
      title: 'My Resume',
      id: 'resume',
    },
  ];

  return (
    <ul>
      {links.map((link) => (
        <li>
          <Link href={link.href}>{link.title}</Link>
        </li>
      ))}
    </ul>
  );
};

export default Navigation;
