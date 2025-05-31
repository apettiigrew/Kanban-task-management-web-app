import { BoardContextProvider } from '@/providers/board-context-provider';
import { SettingsContextProvider } from '@/providers/settings-context';

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  return (
    <BoardContextProvider projectId={id}>
      <SettingsContextProvider>
        {children}
      </SettingsContextProvider>
    </BoardContextProvider>
  );
}
