import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { FirebaseProvider } from '@/providers/FirebaseProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
  title: 'Login - The Design Council',
  description: 'Sign in to The Design Council learning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <FirebaseProvider>{children}</FirebaseProvider>
      </body>
    </html>
  );
}
