import { BoardContextProvider } from '@/context/BoardContext';

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
