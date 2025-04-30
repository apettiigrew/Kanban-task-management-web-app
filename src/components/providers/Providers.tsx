'use client';

import { SessionProvider } from 'next-auth/react';
import { ProjectContextProvider } from '@/providers/ProjectContextProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ProjectContextProvider>{children}</ProjectContextProvider>
    </SessionProvider>
  );
} 