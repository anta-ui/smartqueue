// src/components/organizations/list/OrganizationsList.jsx
import React from 'react';
import { useOrganization } from '@/hooks/organizations/useOrganization';
import OrganizationCard from './OrganizationCard';
import OrganizationFilters from './OrganizationFilters';
import OrganizationActions from './OrganizationActions';

const OrganizationsList = () => {
  const { organizations, loading, error } = useOrganization();
  const [filters, setFilters] = useState({
    status: '',
    plan: '',
    region: ''
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Organisations</h1>
        <OrganizationActions />
      </div>
      
      <OrganizationFilters filters={filters} onFilterChange={setFilters} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations.map(org => (
          <OrganizationCard key={org.id} organization={org} />
        ))}
      </div>
    </div>
  );
};

export default OrganizationsList;