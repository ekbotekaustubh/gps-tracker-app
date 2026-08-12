/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const OrganizationContext = createContext();

const normalizeOrganization = (org) => ({
  ...org,
  status: org.status ? 1 : 0,
});

export const OrganizationProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/organizations');
      setOrganizations((response.data || []).map(normalizeOrganization));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const addOrganization = async (orgData) => {
    await apiClient.post('/organizations', {
      ...orgData,
      status: Boolean(Number(orgData.status)),
    });
    await fetchOrganizations();
  };

  const updateOrganization = async (id, updatedData) => {
    await apiClient.put(`/organizations/${id}`, {
      ...updatedData,
      status: Boolean(Number(updatedData.status)),
    });
    await fetchOrganizations();
  };

  const deleteOrganization = async (id) => {
    await apiClient.delete(`/organizations/${id}`);
    setOrganizations((prev) => prev.filter((o) => o.id !== Number(id)));
  };

  return (
    <OrganizationContext.Provider
      value={{ organizations, loading, error, addOrganization, updateOrganization, deleteOrganization }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganizations = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizations must be used within an OrganizationProvider');
  }
  return context;
};
