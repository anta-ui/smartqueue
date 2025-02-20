// src/components/organizations/list/OrganizationFilters.jsx
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const OrganizationFilters = ({ filters, onFilterChange }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
      <Select
        value={filters.status}
        onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
      >
        <option value="">Tous les statuts</option>
        <option value="active">Actif</option>
        <option value="inactive">Inactif</option>
        <option value="suspended">Suspendu</option>
      </Select>

      <Select
        value={filters.plan}
        onChange={(e) => onFilterChange({ ...filters, plan: e.target.value })}
      >
        <option value="">Tous les plans</option>
        <option value="free">Gratuit</option>
        <option value="premium">Premium</option>
        <option value="enterprise">Enterprise</option>
      </Select>

      <Input
        type="text"
        placeholder="Rechercher par nom..."
        value={filters.search}
        onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
      />
    </div>
  );
};

export default OrganizationFilters;
