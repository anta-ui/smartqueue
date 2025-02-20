// src/components/organizations/list/OrganizationActions.jsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OrganizationActions = () => {
  const navigate = useNavigate();

  const handleExport = () => {
    // Logique d'export
  };

  return (
    <div className="space-x-2">
      <Button 
        onClick={() => navigate('/organizations/new')}
        className="flex items-center"
      >
        <Plus className="w-4 h-4 mr-2" />
        Nouvelle Organisation
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handleExport}
        className="flex items-center"
      >
        <Download className="w-4 h-4 mr-2" />
        Exporter
      </Button>
    </div>
  );
};

export default OrganizationActions;