import React, { useState } from 'react';
import Login from './pages/auth/Login';
import AdminLayout from './layouts/AdminLayout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {isAuthenticated ? (
        <AdminLayout onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <Login onLoginSuccess={() => setIsAuthenticated(true)} />
      )}
    </>
  );
}

export default App;