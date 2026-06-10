import { useState, useEffect } from 'react';

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
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/cities/${stateId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch cities: ${response.statusText}`);
        }
        const data = await response.json();
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
