'use client';

import { SessionProvider } from 'next-auth/react';
import { ProjectContextProvider } from '@/providers/ProjectContextProvider';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProjectContextProvider>
        <NextAuthProvider>{children}</NextAuthProvider>
      </ProjectContextProvider>
    </SessionProvider>
  );
} 