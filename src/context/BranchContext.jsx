/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

const BranchContext = createContext();

export const BranchProvider = ({ children }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBranches = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/branchs/');
      setBranches(response.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const addBranch = async (branchData) => {
    await apiClient.post('/branchs/', {
      org_id: Number(branchData.org_id),
      name: branchData.name,
      address_line_1: branchData.address_line_1,
      address_line_2: branchData.address_line_2,
      city: branchData.city,
      pincode: branchData.pincode,
      country_id: Number(branchData.country_id),
      state_id: Number(branchData.state_id),
      city_id: branchData.city_id ? Number(branchData.city_id) : undefined,
      is_head_office: Number(branchData.is_head_office),
      mobile: branchData.mobile,
      phone: branchData.phone,
      status: Number(branchData.status),
    });
    await fetchBranches();
  };

  const updateBranch = async (id, updatedData) => {
    await apiClient.put(`/branchs/${id}`, {
      org_id: Number(updatedData.org_id),
      name: updatedData.name,
      address_line_1: updatedData.address_line_1,
      address_line_2: updatedData.address_line_2,
      city: updatedData.city,
      pincode: updatedData.pincode,
      country_id: Number(updatedData.country_id),
      state_id: Number(updatedData.state_id),
      city_id: updatedData.city_id ? Number(updatedData.city_id) : undefined,
      is_head_office: Number(updatedData.is_head_office),
      mobile: updatedData.mobile,
      phone: updatedData.phone,
      status: Number(updatedData.status),
    });
    await fetchBranches();
  };

  const deleteBranch = async (id) => {
    await apiClient.delete(`/branchs/${id}`);
    setBranches((prev) => prev.filter((b) => b.id !== Number(id)));
  };

  return (
    <BranchContext.Provider
      value={{ branches, loading, error, addBranch, updateBranch, deleteBranch }}
    >
      {children}
    </BranchContext.Provider>
  );
};

export const useBranches = () => {
  const context = useContext(BranchContext);
  if (!context) {
    throw new Error('useBranches must be used within a BranchProvider');
  }
  return context;
};
