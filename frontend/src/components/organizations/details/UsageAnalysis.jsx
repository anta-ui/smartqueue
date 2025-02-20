// src/components/organizations/detail/UsageAnalysis.jsx
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { useUsageStats } from '@/hooks/organizations/useUsageStats';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const UsageAnalysis = ({ organization }) => {
  const { stats, loading } = useUsageStats(organization.id);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Utilisation API</h3>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#8884d8" 
                  name="Requêtes"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageAnalysis;
