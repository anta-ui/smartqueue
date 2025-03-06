'use client';
import { useRouter } from 'next/navigation';
import OrganizationForm from '@/components/organizations/OrganizationForm';

export default function NewOrganizationPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/super-admin/organizations');
  };

  const handleSuccess = (organizationId: string) => {
    router.push(`/super-admin/organizations/${organizationId}`);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Créer une nouvelle organisation</h1>
      <OrganizationForm onClose={handleClose} onSuccess={handleSuccess} />
    </div>
  );
}