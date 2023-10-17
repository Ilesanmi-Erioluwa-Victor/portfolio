'use client';

import { useState } from 'react';

export const useToggler = () => {
  const [hamburgerOpen, setHamburgerOPen] = useState<boolean | null>(false);

  const toggleHamburger = () => {
    setHamburgerOPen(!hamburgerOpen);
    console.log(hamburgerOpen);
  };

  return { hamburgerOpen, toggleHamburger };
};
