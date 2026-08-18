import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sikh ID — Admin',
  description: 'Manage the Sikh Group ecosystem: members, segments, and campaigns.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans text-navy antialiased">{children}</body>
    </html>
  );
}
