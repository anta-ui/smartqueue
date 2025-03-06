import React, { useEffect, useState } from 'react';
import { superAdminService } from '../services/superAdminService';

const OrganizationFinancial: React.FC = () => {
  const [organizationId, setOrganizationId] = useState<number>(0);
  const [financialData, setFinancialData] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const financialData = await superAdminService.getOrganizationFinancialStatus(organizationId);
        setFinancialData(financialData);
        
        const invoicesData = await superAdminService.getOrganizationInvoices(organizationId);
        setInvoices(invoicesData);
      } catch (error) {
        setError("Impossible de charger les données financières");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [organizationId]);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default OrganizationFinancial; 