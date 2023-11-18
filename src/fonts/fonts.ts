import {
  Inter,
  Roboto_Mono,
  Roboto,
  Inconsolata,
  Overpass,
  Poppins,
} from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400'],
});

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const overpass = Overpass({
  subsets: ['cyrillic'],
  weight: ['800'],
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});

export const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

export const inconsolata = Inconsolata({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
});

export const roboto_mono = Roboto_Mono({
  weight: ['700'],
  subsets: ['latin'],
  display: 'swap',
});
