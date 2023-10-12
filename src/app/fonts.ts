import { Inter, Roboto_Mono, Roboto, Inconsolata } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
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
  subsets: ['latin'],
  display: 'swap',
});
