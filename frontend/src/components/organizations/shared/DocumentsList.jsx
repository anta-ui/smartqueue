// src/components/organizations/shared/DocumentsList.jsx
import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';

const DocumentsList = ({ organizationId }) => {
  const [documents, setDocuments] = React.useState([]);

  const handleUpload = () => {
    // Implémenter la logique d'upload
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <h3 className="text-lg font-semibold">Documents</h3>
        <Button variant="outline" size="sm" onClick={handleUpload} className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          Ajouter un document
        </Button>
      </CardHeader>
      <CardContent>
        <div className="divide-y">
          {documents.map(doc => (
            <div key={doc.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">{doc.name}</p>
                  <p className="text-sm text-gray-500">
                    Ajouté le {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button variant="link">Télécharger</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentsList;