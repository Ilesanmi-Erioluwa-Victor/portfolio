import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LinkItem = ({
  href,
  title,
  tit,
  className,
  children,
}: {
  href: string;
  title?: string;
  tit?: string;
  className: string;
  children?: any;
}) => {
  const router = usePathname();
  const isCurrentRoute = router === href;

  return (
    <li className={isCurrentRoute ? 'hidden' : ''}>
      <Link
        href={href}
        title={tit}
        className={className}
      >
        {children || title}
      </Link>
    </li>
  );
};

export default LinkItem;
