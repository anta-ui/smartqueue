import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OrganizationsPage from './pages/organizations';
import OrganizationDetailPage from './pages/organizations/[id]';
import OrganizationMembersPage from './pages/organizations/[id]/members';
import OrganizationSettingsPage from './pages/organizations/[id]/settings';
import OrganizationBillingPage from './pages/organizations/[id]/billing';
import NewOrganizationPage from './pages/organizations/new';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/organizations">
          <Route index element={<OrganizationsPage />} />
          <Route path="new" element={<NewOrganizationPage />} />
          <Route path=":id">
            <Route index element={<OrganizationDetailPage />} />
            <Route path="members" element={<OrganizationMembersPage />} />
            <Route path="settings" element={<OrganizationSettingsPage />} />
            <Route path="billing" element={<OrganizationBillingPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}