import './globals.css';
import type { Metadata } from 'next';
import { Bar, Footer } from 'src/components';
import { inconsolata } from 'src/fonts/fonts';

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
      <body className={`${inconsolata.className} relative`}>
        <div className='grid grid-cols-[[container-start]_repeat(12,minmax(min-content,12.5rem))] justify-center'>
          <div className='col-[container-start/container-end]'>
            <Bar />
            {children}
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
