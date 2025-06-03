import { BoardContextProvider } from '@/providers/board-context-provider';
import { SettingsContextProvider } from '@/providers/settings-context';

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function RootLayout({ children, params}: RootLayoutProps) {
  const { id } = await params;
  
  return (
    <BoardContextProvider projectId={id}>
      <SettingsContextProvider>
        {children}
      </SettingsContextProvider>
    </BoardContextProvider>
  );
}
