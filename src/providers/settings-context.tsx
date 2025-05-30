'use client';

import { TFields, TSettings, fields } from '@/utils/settings';
import { createContext, ReactNode, useMemo, useState } from 'react';

export type TSettingsContext = {
  fields: TFields;
  settings: TSettings;
  update: (args: Partial<TSettings>) => void;
  reset: () => void;
};

const defaultSettings: TSettings = {
  isBoardMoreObvious: false,
  isOverElementAutoScrollEnabled: true,
  boardScrollSpeed: 'fast',
  columnScrollSpeed: 'standard',
  isFPSPanelEnabled: false,
  isCPUBurnEnabled: false,
  isOverflowScrollingEnabled: true,
};

export const SettingsContext = createContext<TSettingsContext>({
  fields,
  settings: defaultSettings,
  update: () => {},
  reset: () => {},
});

export function SettingsContextProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TSettings>(defaultSettings);

  const value = useMemo(() => {
    function update(partial: Partial<TSettings>) {
      const updated = { ...settings, ...partial };
      setSettings(updated);
    }

    return {
      fields,
      settings,
      update,
      reset: () => update(defaultSettings),
    };
  }, [settings]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}
