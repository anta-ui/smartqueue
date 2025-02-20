// src/app/(dashboard)/organizations/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Organisations - SmartQueue',
  description: 'Gestion des organisations',
};

export default function OrganizationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}