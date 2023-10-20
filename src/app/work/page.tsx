'use client';

import { usePathname } from 'next/navigation';

const Work = () => {
  const pathname = usePathname();
  return <div>{pathname}</div>;
};

export default Work;
