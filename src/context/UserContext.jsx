/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users/?per_page=1000');
      setUsers(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const addUser = async (userData) => {
    await apiClient.post('/auth/register', {
      name: userData.name,
      email: userData.email,
      mobile: userData.mobile,
      branch_id: Number(userData.branch_id),
      role_id: Number(userData.role_id),
      country_id: Number(userData.country_id),
      state_id: Number(userData.state_id),
      username: userData.username,
      password: userData.password,
      address_line_1: userData.address_line_1,
      address_line_2: userData.address_line_2,
      city_id: userData.city_id ? Number(userData.city_id) : undefined,
      pincode: userData.pincode,
    });
    await fetchUsers();
  };

  const updateUser = async (id, updatedData) => {
    await apiClient.put(`/users/${id}`, {
      name: updatedData.name,
      email: updatedData.email,
      mobile: updatedData.mobile,
      username: updatedData.username,
      branch_id: Number(updatedData.branch_id),
      role_id: Number(updatedData.role_id),
      country_id: Number(updatedData.country_id),
      state_id: Number(updatedData.state_id),
      address_line_1: updatedData.address_line_1,
      address_line_2: updatedData.address_line_2,
      city_id: updatedData.city_id ? Number(updatedData.city_id) : undefined,
      pincode: updatedData.pincode,
      status: Number(updatedData.status),
    });
    await fetchUsers();
  };

  const deleteUser = async (id) => {
    await apiClient.delete(`/users/${id}`);
    setUsers((prev) => prev.filter((u) => u.id !== Number(id)));
  };

  return (
    <UserContext.Provider value={{ users, loading, error, addUser, updateUser, deleteUser }}>
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
