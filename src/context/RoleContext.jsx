/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const RoleContext = createContext();

const deriveModule = (permissionKey) => {
  const prefix = (permissionKey || '').split('.')[0] || 'General';
  return prefix
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

const normalizePermission = (p) => ({
  id: p.id,
  name: p.name,
  code: p.permission_key,
  module: deriveModule(p.permission_key),
  description: p.description || '',
  status: p.status,
  isSystem: false,
});

export const RoleProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [permissionsRes, rolesRes] = await Promise.all([
        apiClient.get('/permissions/'),
        apiClient.get('/roles'),
      ]);

      const normalizedPermissions = (permissionsRes.data || []).map(normalizePermission);

      const rolesWithPermissions = await Promise.all(
        (rolesRes.data || []).map(async (role) => {
          try {
            const rolePermsRes = await apiClient.get(`/role_permissions/${role.id}`);
            const permCodes = (rolePermsRes.data?.permissions || []).map((p) => p.permission_key);
            return {
              id: role.id,
              name: role.name,
              description: '',
              status: role.status,
              permissions: permCodes,
              isSystem: false,
            };
          } catch {
            return {
              id: role.id,
              name: role.name,
              description: '',
              status: role.status,
              permissions: [],
              isSystem: false,
            };
          }
        })
      );

      setPermissions(normalizedPermissions);
      setRoles(rolesWithPermissions);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Permission actions
  const addPermission = async (permissionData) => {
    await apiClient.post('/permissions/', {
      name: permissionData.name,
      permission_key: permissionData.code,
      description: permissionData.description,
      status: 1,
    });
    await fetchAll();
  };

  const updatePermission = async (id, updatedData) => {
    await apiClient.put(`/permissions/${id}`, {
      name: updatedData.name,
      permission_key: updatedData.code,
      description: updatedData.description,
    });
    await fetchAll();
  };

  const deletePermission = async (id) => {
    await apiClient.delete(`/permissions/${id}`);
    await fetchAll();
  };

  // Role actions
  const syncRolePermissions = async (roleId, permissionCodes) => {
    const permissionIds = permissions
      .filter((p) => permissionCodes.includes(p.code))
      .map((p) => p.id);
    await apiClient.put('/role_permissions/', {
      role_id: Number(roleId),
      permission_ids: permissionIds,
    });
  };

  const addRole = async (roleData) => {
    const created = await apiClient.post('/roles', {
      name: roleData.name,
      status: 1,
    });
    const newRoleId = created.data?.id;
    if (newRoleId && roleData.permissions?.length) {
      await syncRolePermissions(newRoleId, roleData.permissions);
    }
    await fetchAll();
  };

  const updateRole = async (id, updatedData) => {
    await apiClient.put(`/roles/${id}`, {
      name: updatedData.name,
    });
    await syncRolePermissions(id, updatedData.permissions || []);
    await fetchAll();
  };

  const deleteRole = async (id) => {
    await apiClient.delete(`/roles/${id}`);
    await fetchAll();
  };

  return (
    <RoleContext.Provider
      value={{
        permissions,
        roles,
        loading,
        error,
        addPermission,
        updatePermission,
        deletePermission,
        addRole,
        updateRole,
        deleteRole,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRoles = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRoles must be used within a RoleProvider');
  }
  return context;
};
