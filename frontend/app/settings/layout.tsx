import { ReactNode } from 'react';

export default function SettingsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="settings-layout">
      {children}
    </div>
  );
}