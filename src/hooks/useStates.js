import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

/**
 * Custom hook to fetch states for a specific country from the API
 * @param {number|string} countryId - The ID of the country
 * @returns {Object} - { states, loading, error }
 */
export const useStates = (countryId) => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!countryId) {
      Promise.resolve().then(() => {
        setStates([]);
        setLoading(false);
      });
      return;
    }

    const fetchStates = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/states/${countryId}`);
        setStates(data.data || []);
        setError(null);
      } catch (err) {
        console.error(`Error fetching states for country ${countryId}:`, err);
        setError(err.message);
        setStates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, [countryId]);

  return { states, loading, error };
};

export default useStates;
