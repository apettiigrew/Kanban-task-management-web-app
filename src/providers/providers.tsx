'use client';

import { DeviceInfoProvider } from "./device-info-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DeviceInfoProvider>
      {children}
    </DeviceInfoProvider>
  );
} 