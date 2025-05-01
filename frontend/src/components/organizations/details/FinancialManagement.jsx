// src/components/organizations/detail/FinancialManagement.jsx
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FinancialManagement = ({ organization }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Informations de Facturation</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Plan Actuel</p>
              <p className="font-medium">{organization.billing?.plan}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Prochain Paiement</p>
              <p>{organization.billing?.nextPaymentDate}</p>
            </div>
            <Button>Changer de Plan</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Historique des Factures</h3>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Montant</th>
                <th className="text-left">Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {organization.billing?.invoices.map(invoice => (
                <tr key={invoice.id}>
                  <td>{invoice.date}</td>
                  <td>{invoice.amount} €</td>
                  <td>{invoice.status}</td>
                  <td>
                    <Button variant="link">Télécharger</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialManagement;