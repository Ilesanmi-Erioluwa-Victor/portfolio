import './globals.css';
import type { Metadata } from 'next';
import { Bar, Footer } from '../components';
import { inconsolata } from '../fonts/fonts';

export const metadata: Metadata = {
  title: 'My Portfolio Website',
  description:
    'This is my personal website for blogging and also for displaying all my projects',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={`${inconsolata.className} relative bg-[#f5f4fc] overflow-x-hidden`}>
        <Bar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
