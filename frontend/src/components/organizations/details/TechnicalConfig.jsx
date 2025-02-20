// src/components/organizations/detail/TechnicalConfig.jsx
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import ApiKeyManager from '../shared/ApiKeyManager';

const TechnicalConfig = ({ organization }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Configuration Technique</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ApiKeyManager organizationId={organization.id} />
            
            <div>
              <h4 className="font-medium mb-2">Limites et Quotas</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Requêtes / minute</span>
                  <span>{organization.limits?.requestsPerMinute}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stockage</span>
                  <span>{organization.limits?.storage} GB</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TechnicalConfig;