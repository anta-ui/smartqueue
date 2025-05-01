// src/components/organizations/details/GeneralInfo.tsx
export function GeneralInfo({ organization }: { organization: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Détails du profil */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacts Principaux</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Liste des contacts */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents Légaux</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Liste des documents */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Modifications</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Historique */}
        </CardContent>
      </Card>
    </div>
  );
}