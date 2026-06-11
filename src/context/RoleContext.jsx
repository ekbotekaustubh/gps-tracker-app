import React, { createContext, useState, useContext, useEffect } from 'react';

const RoleContext = createContext();

export const DEFAULT_PERMISSIONS = [
  // Users Module
  { id: 1, name: 'View Users', code: 'users.view', module: 'Users', description: 'Allows viewing system users list and details', isSystem: true },
  { id: 2, name: 'Create Users', code: 'users.create', module: 'Users', description: 'Allows creating new system users', isSystem: true },
  { id: 3, name: 'Edit Users', code: 'users.edit', module: 'Users', description: 'Allows modifying existing system users', isSystem: true },
  { id: 4, name: 'Delete Users', code: 'users.delete', module: 'Users', description: 'Allows deleting system users from the system', isSystem: true },

  // Organizations Module
  { id: 5, name: 'View Organizations', code: 'organizations.view', module: 'Organizations', description: 'Allows viewing organizations list and details', isSystem: true },
  { id: 6, name: 'Create Organizations', code: 'organizations.create', module: 'Organizations', description: 'Allows creating new organizations', isSystem: true },
  { id: 7, name: 'Edit Organizations', code: 'organizations.edit', module: 'Organizations', description: 'Allows modifying existing organizations', isSystem: true },
  { id: 8, name: 'Delete Organizations', code: 'organizations.delete', module: 'Organizations', description: 'Allows deleting organizations', isSystem: true },

  // Branches Module
  { id: 9, name: 'View Branches', code: 'branches.view', module: 'Branches', description: 'Allows viewing branch list and details', isSystem: true },
  { id: 10, name: 'Create Branches', code: 'branches.create', module: 'Branches', description: 'Allows creating new branches', isSystem: true },
  { id: 11, name: 'Edit Branches', code: 'branches.edit', module: 'Branches', description: 'Allows modifying existing branches', isSystem: true },
  { id: 12, name: 'Delete Branches', code: 'branches.delete', module: 'Branches', description: 'Allows deleting branches', isSystem: true },

  // Roles & Permissions Module
  { id: 13, name: 'View Roles', code: 'roles.view', module: 'Roles', description: 'Allows viewing system roles and permissions', isSystem: true },
  { id: 14, name: 'Create Roles', code: 'roles.create', module: 'Roles', description: 'Allows creating new system roles', isSystem: true },
  { id: 15, name: 'Edit Roles', code: 'roles.edit', module: 'Roles', description: 'Allows modifying existing roles', isSystem: true },
  { id: 16, name: 'Delete Roles', code: 'roles.delete', module: 'Roles', description: 'Allows deleting custom roles', isSystem: true },

  // GPS & Devices Module
  { id: 17, name: 'View Devices', code: 'devices.view', module: 'GPS Devices', description: 'Allows viewing GPS tracking device lists', isSystem: true },
  { id: 18, name: 'Manage Devices', code: 'devices.manage', module: 'GPS Devices', description: 'Allows creating, editing, and deleting GPS devices', isSystem: true },

  // Tracking Module
  { id: 19, name: 'Live Tracking', code: 'tracking.live', module: 'Tracking', description: 'Allows viewing live GPS location tracking details', isSystem: true },
  { id: 20, name: 'History Logs', code: 'tracking.history', module: 'Tracking', description: 'Allows querying historical GPS logs and paths', isSystem: true },
];

export const DEFAULT_ROLES = [
  {
    id: 1,
    name: 'Super User',
    description: 'System administrator with unrestricted access to all resources and management operations.',
    permissions: DEFAULT_PERMISSIONS.map(p => p.code),
    isSystem: true,
  },
  {
    id: 2,
    name: 'Org Admin',
    description: 'Administrator with full management capabilities over their organization and its branches.',
    permissions: [
      'users.view', 'users.create', 'users.edit', 'users.delete',
      'branches.view', 'branches.create', 'branches.edit', 'branches.delete',
      'roles.view', 'devices.view', 'devices.manage', 'tracking.live', 'tracking.history'
    ],
    isSystem: true,
  },
  {
    id: 3,
    name: 'Branch Admin',
    description: 'Administrator with local operational control over a specific branch and its operators.',
    permissions: [
      'users.view', 'branches.view', 'devices.view', 'tracking.live', 'tracking.history'
    ],
    isSystem: true,
  },
  {
    id: 4,
    name: 'End User',
    description: 'Standard operator role focusing primarily on tracking devices and viewing reports.',
    permissions: [
      'tracking.live', 'tracking.history'
    ],
    isSystem: true,
  },
];

export const RoleProvider = ({ children }) => {
  const [permissions, setPermissions] = useState(() => {
    const saved = localStorage.getItem('app_permissions');
    return saved ? JSON.parse(saved) : DEFAULT_PERMISSIONS;
  });

  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('app_roles');
    return saved ? JSON.parse(saved) : DEFAULT_ROLES;
  });

  // Keep localStorage in sync
  useEffect(() => {
    localStorage.setItem('app_permissions', JSON.stringify(permissions));
  }, [permissions]);

  useEffect(() => {
    localStorage.setItem('app_roles', JSON.stringify(roles));
  }, [roles]);

  // Permission actions
  const addPermission = (permissionData) => {
    const nextId = permissions.length > 0 ? Math.max(...permissions.map(p => p.id)) + 1 : 1;
    const newPermission = {
      ...permissionData,
      id: nextId,
      isSystem: false,
    };
    setPermissions([...permissions, newPermission]);
    return newPermission;
  };

  const updatePermission = (id, updatedData) => {
    setPermissions(
      permissions.map((p) =>
        p.id === Number(id) && !p.isSystem
          ? { ...p, ...updatedData }
          : p
      )
    );
  };

  const deletePermission = (id) => {
    const permissionToDelete = permissions.find(p => p.id === Number(id));
    if (!permissionToDelete || permissionToDelete.isSystem) return false;

    // Delete permission and also clean it up from any roles that contain it
    setPermissions(permissions.filter(p => p.id !== Number(id)));
    setRoles(
      roles.map(r => ({
        ...r,
        permissions: r.permissions.filter(code => code !== permissionToDelete.code),
      }))
    );
    return true;
  };

  // Role actions
  const addRole = (roleData) => {
    const nextId = roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1;
    const newRole = {
      ...roleData,
      id: nextId,
      isSystem: false,
      permissions: roleData.permissions || [],
    };
    setRoles([...roles, newRole]);
    return newRole;
  };

  const updateRole = (id, updatedData) => {
    setRoles(
      roles.map((r) =>
        r.id === Number(id)
          ? { ...r, ...updatedData, permissions: updatedData.permissions || [] }
          : r
      )
    );
  };

  const deleteRole = (id) => {
    const roleToDelete = roles.find(r => r.id === Number(id));
    if (!roleToDelete || roleToDelete.isSystem) return false;

    setRoles(roles.filter(r => r.id !== Number(id)));
    return true;
  };

  return (
    <RoleContext.Provider
      value={{
        permissions,
        roles,
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
