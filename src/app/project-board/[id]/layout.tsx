import { BoardContextProvider } from '@/providers/board-context-provider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <BoardContextProvider>
        {children}
      </BoardContextProvider>
    </html>
  );
}
