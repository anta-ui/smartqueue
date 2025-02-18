'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { analyticsService } from '@/services/analyticsService';
import { Card, CardHeader, CardContent } from '@/components/common/Card';
import AuthCheck from '@/components/auth/AuthCheck';

function AnalyticsContent() {
  const [queueMetrics, setQueueMetrics] = useState([]);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [feedbackSummary, setFeedbackSummary] = useState({
    total_feedback: 0,
    average_rating: 0,
    average_wait_time_satisfaction: 0,
    average_service_satisfaction: 0,
    rating_distribution: []
  });
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
      
      const [metrics, performance, feedback] = await Promise.all([
        analyticsService.getQueueMetrics(),
        analyticsService.getAgentPerformance(),
        analyticsService.getFeedbackSummary()
      ]);
      
      setQueueMetrics(metrics);
      setAgentPerformance(performance);
      setFeedbackSummary(feedback);
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

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Analytiques</h1>
      {/* Le reste du contenu reste le même */}
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