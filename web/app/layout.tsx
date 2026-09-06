import React from 'react';
import './globals.css';
import { LanguageProvider } from './context/LanguageContext';

export const metadata = {
  title: 'MitraCare — Unified Multi-Role Healthcare Platform',
  description: 'MitraCare & Yaad Caregiver, Doctor, and Admin Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
