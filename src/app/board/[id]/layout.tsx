import { BoardContextProvider } from '@/providers/board-context-provider';
import { SettingsContextProvider } from '@/providers/settings-context';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BoardContextProvider>
      <SettingsContextProvider>
        {children}
      </SettingsContextProvider>
    </BoardContextProvider>
  );
}
