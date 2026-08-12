import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

/**
 * Custom hook to fetch cities for a specific state from the API
 * @param {number|string} stateId - The ID of the state
 * @returns {Object} - { cities, loading, error }
 */
export const useCities = (stateId) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stateId) {
      Promise.resolve().then(() => {
        setCities([]);
        setLoading(false);
      });
      return;
    }

    const fetchCities = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get(`/cities/${stateId}`);
        setCities(data.data || []);
        setError(null);
      } catch (err) {
        console.error(`Error fetching cities for state ${stateId}:`, err);
        setError(err.message);
        setCities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, [stateId]);

  return { cities, loading, error };
};

export default useCities;
