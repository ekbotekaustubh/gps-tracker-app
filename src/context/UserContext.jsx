import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

// Mock static references for dropdowns (based on the database seeds)
export const ROLES = [
  { id: 1, name: 'Super User' },
  { id: 2, name: 'Org Admin' },
  { id: 3, name: 'Branch Admin' },
  { id: 4, name: 'End User' },
];

export const COUNTRIES = [
  { id: 1, name: 'India', country_code: 'IN' },
];

export const STATES = [
  { id: 1, name: 'Andhra Pradesh', country_id: 1 },
  { id: 7, name: 'Gujarat', country_id: 1 },
  { id: 11, name: 'Karnataka', country_id: 1 },
  { id: 12, name: 'Kerala', country_id: 1 },
  { id: 14, name: 'Maharashtra', country_id: 1 },
  { id: 23, name: 'Tamil Nadu', country_id: 1 },
  { id: 24, name: 'Telangana', country_id: 1 },
  { id: 26, name: 'Uttar Pradesh', country_id: 1 },
  { id: 28, name: 'West Bengal', country_id: 1 },
  { id: 32, name: 'Delhi', country_id: 1 },
];

export const CITIES = [
  { id: 273, name: 'Bengaluru', state_id: 11, country_id: 1 },
  { id: 287, name: 'Mumbai', state_id: 14, country_id: 1 },
  { id: 288, name: 'Pune', state_id: 14, country_id: 1 },
  { id: 307, name: 'Chennai', state_id: 23, country_id: 1 },
  { id: 312, name: 'Hyderabad', state_id: 24, country_id: 1 },
  { id: 316, name: 'Lucknow', state_id: 26, country_id: 1 },
  { id: 327, name: 'Kolkata', state_id: 28, country_id: 1 },
  { id: 333, name: 'New Delhi', state_id: 32, country_id: 1 },
];

export const BRANCHES = [
  { id: 0, name: 'System / None' },
  { id: 1, name: 'Head Office (Mumbai)' },
  { id: 2, name: 'Bengaluru Branch' },
  { id: 3, name: 'Pune Branch' },
  { id: 4, name: 'Delhi Branch' },
];

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'admin',
      email: 'admin@email.com',
      mobile: '4565768798',
      branch_id: 0,
      role_id: 1,
      address_line_1: 'System Address',
      address_line_2: '',
      pincode: '400001',
      country_id: 1,
      state_id: 14,
      city_id: 287,
      username: 'admin',
      password: 'adminpassword',
      status: 1, // 0: Inactive, 1: Active
      created_at: '2026-05-29 18:01:20',
      updated_at: '2026-05-29 18:01:20',
    },
    {
      id: 2,
      name: 'Rahul Sharma',
      email: 'rahul@email.com',
      mobile: '9876543210',
      branch_id: 1,
      role_id: 2,
      address_line_1: '202, Metro Towers',
      address_line_2: 'Bandra West',
      pincode: '400050',
      country_id: 1,
      state_id: 14,
      city_id: 287,
      username: 'rahul_admin',
      password: 'userpassword',
      status: 1,
      created_at: '2026-06-01 10:00:00',
      updated_at: '2026-06-01 10:00:00',
    },
    {
      id: 3,
      name: 'Priya Patel',
      email: 'priya@email.com',
      mobile: '8765432109',
      branch_id: 3,
      role_id: 3,
      address_line_1: '45, Orchard Road',
      address_line_2: 'Kothrud',
      pincode: '411038',
      country_id: 1,
      state_id: 14,
      city_id: 288,
      username: 'priya_kothrud',
      password: 'userpassword',
      status: 0,
      created_at: '2026-06-02 11:30:00',
      updated_at: '2026-06-02 11:30:00',
    }
  ]);

  const addUser = (userData) => {
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newUser = {
      ...userData,
      id: newId,
      status: Number(userData.status),
      branch_id: Number(userData.branch_id),
      role_id: Number(userData.role_id),
      country_id: Number(userData.country_id),
      state_id: Number(userData.state_id),
      city_id: Number(userData.city_id),
      created_at: now,
      updated_at: now,
    };
    setUsers([...users, newUser]);
  };

  const updateUser = (id, updatedData) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setUsers(
      users.map((u) =>
        u.id === Number(id)
          ? {
              ...u,
              ...updatedData,
              status: Number(updatedData.status),
              branch_id: Number(updatedData.branch_id),
              role_id: Number(updatedData.role_id),
              country_id: Number(updatedData.country_id),
              state_id: Number(updatedData.state_id),
              city_id: Number(updatedData.city_id),
              updated_at: now,
            }
          : u
      )
    );
  };

  const deleteUser = (id) => {
    setUsers(users.filter((u) => u.id !== Number(id)));
  };

  return (
    <UserContext.Provider value={{ users, addUser, updateUser, deleteUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};
