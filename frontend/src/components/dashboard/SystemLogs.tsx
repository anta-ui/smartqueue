'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { SystemLog } from '@/types/dashboard';

export const SystemLogs: React.FC = () => {
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);

  useEffect(() => {
    // Simulation de logs système
    const generateMockLogs = () => {
      const mockServices = ['API', 'Base de données', 'Authentification', 'Cache'];
      const mockLevels: SystemLog['level'][] = ['info', 'warning', 'error'];

      const newLog: SystemLog = {
        id: Math.random().toString(),
        timestamp: new Date().toISOString(),
        level: mockLevels[Math.floor(Math.random() * mockLevels.length)],
        service: mockServices[Math.floor(Math.random() * mockServices.length)],
        message: `Événement système généré à ${new Date().toLocaleTimeString()}`
      };

      setSystemLogs(prevLogs => [newLog, ...prevLogs].slice(0, 50));
    };

    // Génération de logs toutes les 5 secondes
    const interval = setInterval(generateMockLogs, 5000);

    // Génération d'un log initial
    generateMockLogs();

    // Nettoyage de l'intervalle
    return () => clearInterval(interval);
  }, []);

  const getLogLevelClass = (level: SystemLog['level']) => {
    switch (level) {
      case 'error': return 'bg-red-50 text-red-700';
      case 'warning': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-medium">Logs Système en Direct</h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {systemLogs.length === 0 ? (
            <p className="text-gray-500 text-center">Aucun log système</p>
          ) : (
            systemLogs.map(log => (
              <div 
                key={log.id} 
                className={`p-2 rounded ${getLogLevelClass(log.level)}`}
              >
                <div className="flex justify-between">
                  <span className="font-medium">{log.service}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm">{log.message}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};