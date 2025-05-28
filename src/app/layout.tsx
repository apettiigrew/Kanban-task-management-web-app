import type { Metadata } from 'next';
import "./../styles/main.scss";
import { Providers } from '@/providers/providers';

export const metadata: Metadata = {
  title: 'Next.js App with SCSS Modules',
  description: 'A Next.js application using SCSS modules for styling',
};

export default function RootLayout({ children }: { children: React.ReactNode}) {
  return (
    <html lang="en">
      <Providers>
        <body>{children}</body>
      </Providers>
    </html>
  );
}
