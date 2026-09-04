import React from 'react';

export const metadata = {
  title: 'Yaad — Unified Multi-Role Healthcare Platform',
  description: 'MitraCare & Yaad Caregiver, Doctor, and Admin Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#F8FAF8' }}>
        {children}
      </body>
    </html>
  );
}
