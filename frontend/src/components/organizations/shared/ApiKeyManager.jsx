// src/components/organizations/shared/ApiKeyManager.jsx
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw } from 'lucide-react';

const ApiKeyManager = ({ organizationId }) => {
  const [apiKey, setApiKey] = React.useState('****************************************');
  const [showKey, setShowKey] = React.useState(false);

  const handleRegenerateKey = async () => {
    // Implémenter la logique de régénération de clé
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Clé API</h4>
      <div className="flex items-center gap-2">
        <code className="flex-1 p-2 bg-gray-100 rounded">
          {showKey ? apiKey : apiKey.replace(/./g, '*')}
        </code>
        <Button variant="outline" size="sm" onClick={() => setShowKey(!showKey)}>
          {showKey ? 'Masquer' : 'Afficher'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleCopyKey}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleRegenerateKey}
        className="flex items-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        Régénérer la clé
      </Button>
    </div>
  );
};

export default ApiKeyManager;