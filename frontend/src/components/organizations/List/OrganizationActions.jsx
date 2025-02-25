// src/components/organizations/list/OrganizationActions.jsx
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const OrganizationActions = () => {
  return (
    <Link href="/dashboard/organizations/new" passHref>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Nouvelle Organisation
      </Button>
    </Link>
  );
};

export default OrganizationActions;