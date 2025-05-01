// src/components/organizations/shared/MembersList.jsx
import React from 'react';
import { useMembers } from '@/hooks/organizations/useMembers';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, MoreVertical } from 'lucide-react';

const MembersList = ({ organizationId }) => {
  const { members, loading, error, addMember, removeMember } = useMembers(organizationId);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error.message}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold">Membres</h3>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Ajouter un membre
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {members.map(member => (
            <div key={member.id} className="py-4 flex items-center justify-between">
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MembersList;