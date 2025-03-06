import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SimpleSpinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { superAdminService } from '@/services/superAdminService';
import { DataDebugger } from '@/components/debug/DataDebugger';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from '@/components/ui/charts';

interface UsageAnalysisProps {
  organizationId: number;
}

export function UsageAnalysis({ organizationId }: UsageAnalysisProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usageData, setUsageData] = useState<any>(null);
  const [debugMode, setDebugMode] = useState(false);
  
  useEffect(() => {
    const fetchUsageData = async () => {
      try {
        setLoading(true);
        
        // Vérifier si l'ID est valide
        if (!organizationId || isNaN(Number(organizationId))) {
          throw new Error("ID d'organisation invalide");
        }
        
        // Simuler la récupération des données d'utilisation
        // Dans un environnement réel, vous appelleriez votre API
        // const data = await superAdminService.getOrganizationUsage(Number(organizationId));
        
        // Données simulées pour le développement
        const data = {
          apiUsage: {
            daily: [
              { date: '2023-01-01', requests: 1200 },
              { date: '2023-01-02', requests: 1500 },
              { date: '2023-01-03', requests: 1800 },
              { date: '2023-01-04', requests: 1300 },
              { date: '2023-01-05', requests: 2000 },
              { date: '2023-01-06', requests: 2200 },
              { date: '2023-01-07', requests: 1900 },
            ],
            endpoints: [
              { name: '/users', requests: 5000 },
              { name: '/products', requests: 3500 },
              { name: '/orders', requests: 2800 },
              { name: '/analytics', requests: 1200 },
              { name: '/auth', requests: 4500 },
            ],
          },
          performance: {
            responseTime: [
              { date: '2023-01-01', time: 120 },
              { date: '2023-01-02', time: 115 },
              { date: '2023-01-03', time: 130 },
              { date: '2023-01-04', time: 125 },
              { date: '2023-01-05', time: 110 },
              { date: '2023-01-06', time: 105 },
              { date: '2023-01-07', time: 100 },
            ],
            errorRate: [
              { date: '2023-01-01', rate: 2.1 },
              { date: '2023-01-02', rate: 1.8 },
              { date: '2023-01-03', rate: 2.3 },
              { date: '2023-01-04', rate: 1.9 },
              { date: '2023-01-05', rate: 1.5 },
              { date: '2023-01-06', rate: 1.2 },
              { date: '2023-01-07', rate: 1.0 },
            ],
          },
          incidents: [
            { id: 1, date: '2023-01-03', type: 'API Downtime', duration: '15 minutes', impact: 'Medium', resolved: true },
            { id: 2, date: '2023-01-05', type: 'Database Slowdown', duration: '30 minutes', impact: 'Low', resolved: true },
            { id: 3, date: '2023-01-07', type: 'Authentication Issues', duration: '10 minutes', impact: 'High', resolved: true },
          ],
          satisfaction: {
            overall: 4.2,
            breakdown: [
              { rating: 5, percentage: 45 },
              { rating: 4, percentage: 35 },
              { rating: 3, percentage: 15 },
              { rating: 2, percentage: 3 },
              { rating: 1, percentage: 2 },
            ],
            trend: [
              { month: 'Jan', score: 4.0 },
              { month: 'Feb', score: 4.1 },
              { month: 'Mar', score: 4.0 },
              { month: 'Apr', score: 4.2 },
              { month: 'May', score: 4.3 },
              { month: 'Jun', score: 4.2 },
            ],
          },
        };
        
        setUsageData(data);
        setError(null);
      } catch (err: any) {
        console.error("Erreur lors du chargement des données d'utilisation:", err);
        setError(err.message || "Une erreur est survenue");
        toast({
          title: "Erreur",
          description: err.message || "Impossible de charger les données d'utilisation",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsageData();
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
          <CardTitle>Analyse d'Utilisation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!usageData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Analyse d'Utilisation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Aucune donnée d'utilisation disponible pour cette organisation.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      {debugMode && (
        <DataDebugger data={usageData} title="Données d'utilisation" />
      )}
      
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setDebugMode(!debugMode)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {debugMode ? "Masquer" : "Afficher"} les données brutes
        </button>
      </div>
      
      <Tabs defaultValue="usage">
        <TabsList>
          <TabsTrigger value="usage">Utilisation API</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="satisfaction">Satisfaction Client</TabsTrigger>
        </TabsList>
        
        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilisation Quotidienne de l'API</CardTitle>
              <CardDescription>Nombre de requêtes API par jour</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {/* Remplacez par votre composant de graphique réel */}
              <div className="bg-gray-100 h-full rounded-md flex items-center justify-center">
                <p className="text-gray-500">Graphique d'utilisation quotidienne</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Utilisation par Endpoint</CardTitle>
              <CardDescription>Répartition des requêtes par endpoint</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {/* Remplacez par votre composant de graphique réel */}
              <div className="bg-gray-100 h-full rounded-md flex items-center justify-center">
                <p className="text-gray-500">Graphique d'utilisation par endpoint</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Temps de Réponse</CardTitle>
              <CardDescription>Temps de réponse moyen en millisecondes</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {/* Remplacez par votre composant de graphique réel */}
              <div className="bg-gray-100 h-full rounded-md flex items-center justify-center">
                <p className="text-gray-500">Graphique de temps de réponse</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Taux d'Erreur</CardTitle>
              <CardDescription>Pourcentage de requêtes ayant échoué</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {/* Remplacez par votre composant de graphique réel */}
              <div className="bg-gray-100 h-full rounded-md flex items-center justify-center">
                <p className="text-gray-500">Graphique de taux d'erreur</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="incidents">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Incidents</CardTitle>
              <CardDescription>Incidents récents affectant cette organisation</CardDescription>
            </CardHeader>
            <CardContent>
              {usageData.incidents.length === 0 ? (
                <p className="text-gray-500">Aucun incident récent</p>
              ) : (
                <div className="space-y-4">
                  {usageData.incidents.map((incident) => (
                    <div key={incident.id} className="border p-4 rounded-md">
                      <div className="flex justify-between">
                        <h4 className="font-medium">{incident.type}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs ${incident.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {incident.resolved ? 'Résolu' : 'En cours'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Date: {incident.date}</p>
                      <p className="text-sm text-gray-500">Durée: {incident.duration}</p>
                      <p className="text-sm text-gray-500">Impact: {incident.impact}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="satisfaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Satisfaction Globale</CardTitle>
              <CardDescription>Note moyenne de satisfaction client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <div className="text-5xl font-bold mb-2">{usageData.satisfaction.overall}</div>
                <div className="text-sm text-gray-500">sur 5</div>
                
                <div className="w-full mt-6">
                  {usageData.satisfaction.breakdown.map((item) => (
                    <div key={item.rating} className="flex items-center mb-2">
                      <div className="w-8 text-right mr-2">{item.rating}★</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-4">
                        <div 
                          className="bg-blue-500 h-4 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                      <div className="w-12 text-right ml-2">{item.percentage}%</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Tendance de Satisfaction</CardTitle>
              <CardDescription>Évolution de la satisfaction au fil du temps</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              {/* Remplacez par votre composant de graphique réel */}
              <div className="bg-gray-100 h-full rounded-md flex items-center justify-center">
                <p className="text-gray-500">Graphique de tendance de satisfaction</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}