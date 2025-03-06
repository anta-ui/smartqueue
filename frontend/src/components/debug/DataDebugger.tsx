import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DataDebuggerProps {
  data: any;
  title?: string;
}

export function DataDebugger({ data, title = "Données brutes" }: DataDebuggerProps) {
  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-xs">
          {JSON.stringify(data, null, 2)}
        </pre>
      </CardContent>
    </Card>
  );
} 