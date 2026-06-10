/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext } from 'react';

const OrganizationContext = createContext();

export const OrganizationProvider = ({ children }) => {
  const [organizations, setOrganizations] = useState([
    {
      id: 1,
      name: 'Nexus Corp',
      status: 1, // 1: Active, 0: Inactive
      created_at: '2026-06-01 10:00:00',
      updated_at: '2026-06-01 10:00:00',
    },
    {
      id: 2,
      name: 'Apex Logistics',
      status: 1,
      created_at: '2026-06-02 11:30:00',
      updated_at: '2026-06-02 11:30:00',
    },
    {
      id: 3,
      name: 'Global Ventures',
      status: 0,
      created_at: '2026-06-03 14:15:00',
      updated_at: '2026-06-03 14:15:00',
    }
  ]);

  const addOrganization = (orgData) => {
    const newId = organizations.length > 0 ? Math.max(...organizations.map(o => o.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newOrg = {
      ...orgData,
      id: newId,
      status: Number(orgData.status),
      created_at: now,
      updated_at: now,
    };
    setOrganizations([...organizations, newOrg]);
  };

  const updateOrganization = (id, updatedData) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setOrganizations(
      organizations.map((o) =>
        o.id === Number(id)
          ? {
              ...o,
              ...updatedData,
              status: Number(updatedData.status),
              updated_at: now,
            }
          : o
      )
    );
  };

  const deleteOrganization = (id) => {
    setOrganizations(organizations.filter((o) => o.id !== Number(id)));
  };

  return (
    <OrganizationContext.Provider value={{ organizations, addOrganization, updateOrganization, deleteOrganization }}>
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
