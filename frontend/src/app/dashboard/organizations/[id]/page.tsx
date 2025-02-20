// src/app/(dashboard)/organizations/[id]/page.tsx
"use client";

import { useParams } from 'next/navigation';
import  OrganizationDetail  from '@/components/organizations/details/OrganizationDetail';

export default function OrganizationDetailPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto p-6">
      <OrganizationDetail id={id} />
    </div>
  );
}