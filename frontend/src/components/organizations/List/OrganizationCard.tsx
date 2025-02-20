// src/components/organizations/list/OrganizationCard.jsx
import React from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const OrganizationCard = ({ organization }) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{organization.name}</h3>
          <span className={`px-2 py-1 rounded text-sm ${
            organization.status === 'active' ? 'bg-green-100 text-green-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {organization.status}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p>Plan: {organization.plan}</p>
          <p>Région: {organization.region}</p>
          <p>Membres: {organization.memberCount}</p>
        </div>
      </CardContent>
      <CardFooter className="space-x-2">
        <Button variant="outline" size="sm">
          <Link to={`/organizations/${organization.id}`}>
            Voir détails
          </Link>
        </Button>
        <Button variant="outline" size="sm">Contacter</Button>
      </CardFooter>
    </Card>
  );
};

export default OrganizationCard;