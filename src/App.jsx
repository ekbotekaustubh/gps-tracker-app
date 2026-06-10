import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import UserList from './pages/users/UserList';
import UserForm from './pages/users/UserForm';
import OrganizationList from './pages/organizations/OrganizationList';
import OrganizationForm from './pages/organizations/OrganizationForm';
import OrganizationDetail from './pages/organizations/OrganizationDetail';
import BranchForm from './pages/branches/BranchForm';
import { UserProvider } from './context/UserContext';
import { OrganizationProvider } from './context/OrganizationContext';
import { BranchProvider } from './context/BranchContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('auth_token');
  });

  const handleLogout = async () => {
    const token = localStorage.getItem('auth_token');

    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      // Always clear local data and redirect to login, even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
    }
  };

  return (
    <UserProvider>
      <OrganizationProvider>
        <BranchProvider>
          <Routes>
            {isAuthenticated ? (
              <Route path="/" element={<AdminLayout onLogout={handleLogout} />}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<UserList />} />
                <Route path="users/new" element={<UserForm />} />
                <Route path="users/edit/:id" element={<UserForm />} />
                <Route path="organizations" element={<OrganizationList />} />
                <Route path="organizations/new" element={<OrganizationForm />} />
                <Route path="organizations/edit/:id" element={<OrganizationForm />} />
                <Route path="organizations/view/:id" element={<OrganizationDetail />} />
                <Route path="branches/new" element={<BranchForm />} />
                <Route path="branches/edit/:id" element={<BranchForm />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            ) : (
              <Route path="*" element={<Login onLoginSuccess={() => setIsAuthenticated(true)} />} />
            )}
          </Routes>
        </BranchProvider>
      </OrganizationProvider>
    </UserProvider>
  );
}

export default App;