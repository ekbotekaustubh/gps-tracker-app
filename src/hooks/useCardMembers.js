import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

/**
 * Custom hook to fetch tracked employees (card members), optionally scoped to a branch.
 * @param {number|string|null} branchId - Optional branch ID to filter by
 * @returns {Object} - { cardMembers, loading, error }
 */
export const useCardMembers = (branchId) => {
  const [cardMembers, setCardMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchCardMembers = async () => {
      try {
        setLoading(true);
        const query = branchId ? `?branch_id=${branchId}` : '';
        const data = await apiClient.get(`/card_members/${query}`);
        if (!cancelled) {
          setCardMembers(data.data || []);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching card members:', err);
        if (!cancelled) {
          setError(err.message);
          setCardMembers([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchCardMembers();

    return () => {
      cancelled = true;
    };
  }, [branchId]);

  return { cardMembers, loading, error };
};
