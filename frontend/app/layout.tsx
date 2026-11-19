import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'AFTERHOURS — Make something happen', description: 'An AI-powered social coordination playground.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
