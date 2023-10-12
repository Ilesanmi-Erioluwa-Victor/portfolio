import './globals.css';
import type { Metadata } from 'next';
import { roboto, inconsolata } from './fonts';

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
      <body className={inconsolata.className}>{children}</body>
    </html>
  );
}
