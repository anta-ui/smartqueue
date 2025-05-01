'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { analyticsService } from '@/services/analyticsService';
import { Card, CardHeader, CardContent } from '@/components/common/Card';
import AuthCheck from '@/components/auth/AuthCheck';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Définition des interfaces pour le typage
interface QueueMetric {
  id: number;
  date: string;
  total_tickets: number;
  served_tickets: number;
  cancelled_tickets: number;
  no_shows: number;
  average_wait_time: number;
  average_service_time: number;
  peak_hours: { [hour: string]: number };
  satisfaction_score: number;
}

interface AgentMetric {
  id: number;
  agent: {
    id: number;
    name: string;
    email: string;
  };
  customers_served: number;
  average_service_time: number;
  service_rating: number;
}

interface FeedbackSummary {
  total_feedback: number;
  average_rating: number | null;
  average_wait_time_satisfaction: number | null;
  average_service_satisfaction: number | null;
  rating_distribution: Array<{
    rating: number;
    count: number;
  }>;
}

function AnalyticsContent() {
  // États typés explicitement
  const [queueMetrics, setQueueMetrics] = useState<QueueMetric[]>([]);
  const [agentPerformance, setAgentPerformance] = useState<AgentMetric[]>([]);
  const [feedbackSummary, setFeedbackSummary] = useState<FeedbackSummary>({
    total_feedback: 0,
    average_rating: 0,
    average_wait_time_satisfaction: 0,
    average_service_satisfaction: 0,
    rating_distribution: []
  });

  // Nouveaux états avec typage
  const [timeSeriesData, setTimeSeriesData] = useState<Array<{
    date: string;
    servedTickets: number;
    cancelledTickets: number;
  }>>([]);

  const [topPerformingAgents, setTopPerformingAgents] = useState<AgentMetric[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Chargement des données avec typage
      const [metrics, performance, feedback] = await Promise.all([
        analyticsService.getQueueMetrics(),
        analyticsService.getAgentPerformance(),
        analyticsService.getFeedbackSummary()
      ]);

      // Transformation des données avec typage explicite
      const timeSeriesMetrics = metrics.map((m: QueueMetric) => ({
        date: m.date,
        servedTickets: m.served_tickets,
        cancelledTickets: m.cancelled_tickets
      }));

      // Tri des agents avec typage
      const topAgents = performance
        .sort((a: AgentMetric, b: AgentMetric) => b.customers_served - a.customers_served)
        .slice(0, 5);

      // Mise à jour des états
      setQueueMetrics(metrics);
      setAgentPerformance(performance);
      setFeedbackSummary(feedback);
      setTimeSeriesData(timeSeriesMetrics);
      setTopPerformingAgents(topAgents);

    } catch (err: any) {
      console.error('Error loading data:', err);
      if (err.response?.status === 401) {
        router.push('/login');
      } else {
        setError('Erreur lors du chargement des données');
      }
    } finally {
      setLoading(false);
    }
  };

  // Composants de visualisation
  const QueuePerformanceChart = () => (
    <Card className="w-full">
      <CardHeader>Performance de la File d'Attente</CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="servedTickets" 
              stroke="#8884d8" 
              name="Tickets Traités" 
            />
            <Line 
              type="monotone" 
              dataKey="cancelledTickets" 
              stroke="#82ca9d" 
              name="Tickets Annulés" 
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const TopAgentsPerformance = () => (
    <Card className="w-full">
      <CardHeader>Top Agents</CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={topPerformingAgents}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="agent.name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="customers_served" fill="#8884d8">
              {topPerformingAgents.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`hsl(${index * 60}, 70%, 50%)`} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  const FeedbackDistribution = () => (
    <Card className="w-full">
      <CardHeader>Distribution des Évaluations</CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={feedbackSummary.rating_distribution}
              dataKey="count"
              nameKey="rating"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {feedbackSummary.rating_distribution.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`hsl(${index * 60}, 70%, 50%)`} 
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );

  // Gestion des états de chargement et d'erreur
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement des analytiques...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{error}</p>
          <button
            onClick={loadData}
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Tableau de Bord Analytique</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <QueuePerformanceChart />
        <TopAgentsPerformance />
        <FeedbackDistribution />
        
        {/* Cartes de statistiques rapides */}
        <Card>
          <CardHeader>Statistiques Globales</CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total des Tickets</p>
                <p className="text-2xl font-bold">{queueMetrics.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Note Moyenne</p>
                <p className="text-2xl font-bold">
                  {feedbackSummary.average_rating?.toFixed(2) || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AuthCheck>
      <AnalyticsContent />
    </AuthCheck>
  );
}