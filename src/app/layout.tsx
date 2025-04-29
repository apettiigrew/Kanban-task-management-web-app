import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';
import { ProjectContextProvider } from '@/providers/ProjectContextProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kanban App",
  description: "A modern kanban board application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProjectContextProvider>
          <NextAuthProvider>{children}</NextAuthProvider>
        </ProjectContextProvider>
      </body>
    </html>
  );
}
