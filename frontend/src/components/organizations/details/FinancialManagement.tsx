import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SimpleSpinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { superAdminService } from '@/services/superAdminService';
import { DataDebugger } from '@/components/debug/DataDebugger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, CreditCard, DollarSign, Calendar } from 'lucide-react';

interface FinancialManagementProps {
  organizationId: number;
}

export function FinancialManagement({ organizationId }: FinancialManagementProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [financialData, setFinancialData] = useState<any>(null);
  const [debugMode, setDebugMode] = useState(false);
  
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        
        // Vérifier si l'ID est valide
        if (!organizationId || isNaN(Number(organizationId))) {
          throw new Error("ID d'organisation invalide");
        }
        
        // Simuler la récupération des données financières
        // Dans un environnement réel, vous appelleriez votre API
        // const data = await superAdminService.getOrganizationFinancial(Number(organizationId));
        
        // Données simulées pour le développement
        const data = {
          paymentStatus: {
            status: 'active',
            nextBillingDate: '2023-02-15',
            currentBalance: 0,
            paymentMethod: {
              type: 'card',
              last4: '4242',
              expiry: '04/25',
              brand: 'Visa'
            }
          },
          invoices: [
            { id: 1, number: 'INV-2023-001', date: '2023-01-01', amount: 199.99, status: 'paid', pdfUrl: '#' },
            { id: 2, number: 'INV-2023-002', date: '2023-02-01', amount: 199.99, status: 'paid', pdfUrl: '#' },
            { id: 3, number: 'INV-2023-003', date: '2023-03-01', amount: 199.99, status: 'pending', pdfUrl: '#' },
          ],
          adjustments: [
            { id: 1, date: '2023-01-15', type: 'credit', amount: 50.00, reason: 'Service outage compensation', appliedTo: 'INV-2023-002' },
            { id: 2, date: '2023-02-10', type: 'refund', amount: 25.00, reason: 'Feature unavailability', appliedTo: 'INV-2023-002' },
          ],
          financialReports: {
            monthly: [
              { month: 'Jan 2023', revenue: 199.99, costs: 0, profit: 199.99 },
              { month: 'Feb 2023', revenue: 174.99, costs: 0, profit: 174.99 },
              { month: 'Mar 2023', revenue: 199.99, costs: 0, profit: 199.99 },
            ],
            annual: {
              currentYear: { revenue: 574.97, costs: 0, profit: 574.97 },
              previousYear: { revenue: 2399.88, costs: 0, profit: 2399.88 },
            }
          }
        };
        
        setFinancialData(data);
        setError(null);
      } catch (err: any) {
        console.error("Erreur lors du chargement des données financières:", err);
        setError(err.message || "Une erreur est survenue");
        toast({
          title: "Erreur",
          description: err.message || "Impossible de charger les données financières",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchFinancialData();
  }, [organizationId, toast]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <SimpleSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion Financière</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!financialData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestion Financière</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucune donnée financière disponible pour cette organisation.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {debugMode && (
        <DataDebugger data={financialData} title="Données financières" />
      )}
      
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {debugMode ? "Masquer" : "Afficher"} les données brutes
        </button>
      </div>
      
      <Tabs defaultValue="payment">
        <TabsList>
          <TabsTrigger value="payment">État des Paiements</TabsTrigger>
          <TabsTrigger value="invoices">Historique des Factures</TabsTrigger>
          <TabsTrigger value="adjustments">Ajustements et Crédits</TabsTrigger>
          <TabsTrigger value="reports">Rapports Financiers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>État des Paiements</CardTitle>
              <CardDescription>Informations sur le statut de paiement et le mode de facturation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Statut de Paiement</h3>
                    <div className="mt-1 flex items-center">
                      <Badge className={financialData.paymentStatus.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {financialData.paymentStatus.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Solde Actuel</h3>
                    <p className="mt-1 text-lg font-semibold">
                      {financialData.paymentStatus.currentBalance === 0 
                        ? "0,00 €" 
                        : `${financialData.paymentStatus.currentBalance.toFixed(2).replace('.', ',')} €`}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Prochaine Facturation</h3>
                    <p className="mt-1 flex items-center">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      {new Date(financialData.paymentStatus.nextBillingDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Moyen de Paiement</h3>
                    <div className="mt-1 p-3 border rounded-md">
                      <div className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-gray-400" />
                        <span className="font-medium">
                          {financialData.paymentStatus.paymentMethod.brand} •••• {financialData.paymentStatus.paymentMethod.last4}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Expire le {financialData.paymentStatus.paymentMethod.expiry}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Mettre à jour le moyen de paiement
                    </Button>
                    <Button variant="outline" size="sm">
                      Générer une facture
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Factures</CardTitle>
              <CardDescription>Liste des factures émises pour cette organisation</CardDescription>
            </CardHeader>
            <CardContent>
              {financialData.invoices.length === 0 ? (
                <p className="text-gray-500">Aucune facture disponible</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData.invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell>{invoice.number}</TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                        <TableCell>{invoice.amount.toFixed(2).replace('.', ',')} €</TableCell>
                        <TableCell>
                          <Badge className={
                            invoice.status === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : invoice.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }>
                            {invoice.status === 'paid' ? 'Payée' : invoice.status === 'pending' ? 'En attente' : 'Impayée'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="adjustments">
          <Card>
            <CardHeader>
              <CardTitle>Ajustements et Crédits</CardTitle>
              <CardDescription>Historique des ajustements appliqués au compte</CardDescription>
            </CardHeader>
            <CardContent>
              {financialData.adjustments.length === 0 ? (
                <p className="text-gray-500">Aucun ajustement disponible</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Appliqué à</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData.adjustments.map((adjustment) => (
                      <TableRow key={adjustment.id}>
                        <TableCell>{new Date(adjustment.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className={
                            adjustment.type === 'credit' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }>
                            {adjustment.type === 'credit' ? 'Crédit' : 'Remboursement'}
                          </Badge>
                        </TableCell>
                        <TableCell>{adjustment.amount.toFixed(2).replace('.', ',')} €</TableCell>
                        <TableCell>{adjustment.reason}</TableCell>
                        <TableCell>{adjustment.appliedTo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              
              <div className="mt-6">
                <Button variant="outline">
                  Ajouter un ajustement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Rapport Mensuel</CardTitle>
                <CardDescription>Revenus mensuels pour cette organisation</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mois</TableHead>
                      <TableHead>Revenus</TableHead>
                      <TableHead>Coûts</TableHead>
                      <TableHead>Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData.financialReports.monthly.map((month, index) => (
                      <TableRow key={index}>
                        <TableCell>{month.month}</TableCell>
                        <TableCell>{month.revenue.toFixed(2).replace('.', ',')} €</TableCell>
                        <TableCell>{month.costs.toFixed(2).replace('.', ',')} €</TableCell>
                        <TableCell>{month.profit.toFixed(2).replace('.', ',')} €</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Rapport Annuel</CardTitle>
                <CardDescription>Comparaison des revenus annuels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Année en cours</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Revenus</p>
                        <p className="text-lg font-semibold">{financialData.financialReports.annual.currentYear.revenue.toFixed(2).replace('.', ',')} €</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Coûts</p>
                        <p className="text-lg font-semibold">{financialData.financialReports.annual.currentYear.costs.toFixed(2).replace('.', ',')} €</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Profit</p>
                        <p className="text-lg font-semibold">{financialData.financialReports.annual.currentYear.profit.toFixed(2).replace('.', ',')} €</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Année précédente</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Revenus</p>
                        <p className="text-lg font-semibold">{financialData.financialReports.annual.previousYear.revenue.toFixed(2).replace('.', ',')} €</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Coûts</p>
                        <p className="text-lg font-semibold">{financialData.financialReports.annual.previousYear.costs.toFixed(2).replace('.', ',')} €</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-xs text-gray-500">Profit</p>
                        <p className="text-lg font-semibold">{financialData.financialReports.annual.previousYear.profit.toFixed(2).replace('.', ',')} €</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      Télécharger le rapport complet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}