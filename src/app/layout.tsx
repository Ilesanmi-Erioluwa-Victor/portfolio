import "./globals.css";
import type { Metadata } from "next";
import { inconsolata } from "src/fonts/fonts";

import { Header } from "src/components";

export const metadata: Metadata = {
  title: "My Portfolio Website",
  description: "This is my personal website for blogging and also for displaying all my projects",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inconsolata.className} relative`}>
        <div className="grid grid-cols-[[container-start]_repeat(12,minmax(min-content,12.5rem))] justify-center">
          <div className="col-[container-start/container-end]">
            <Header />
            {children}
            <h4>Hello from Footer</h4>
          </div>
        </div>
      </body>
    </html>
  );
}
