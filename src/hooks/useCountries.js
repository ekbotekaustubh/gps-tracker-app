import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch countries from the API
 * @returns {Object} - { countries, loading, error }
 */
export const useCountries = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/countries`);
        if (!response.ok) {
          throw new Error(`Failed to fetch countries: ${response.statusText}`);
        }
        const data = await response.json();
        setCountries(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching countries:', err);
        setError(err.message);
        // Fallback to empty array
        setCountries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  return { countries, loading, error };
};

/**
 * Custom hook to fetch a single country by ID
 * @param {number} countryId - The country ID
 * @returns {Object} - { country, loading, error }
 */
export const useCountryById = (countryId) => {
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!countryId) {
      Promise.resolve().then(() => {
        setLoading(false);
      });
      return;
    }

    const fetchCountry = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/countries/${countryId}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch country: ${response.statusText}`);
        }
        const data = await response.json();
        setCountry(data.data || null);
        setError(null);
      } catch (err) {
        console.error('Error fetching country:', err);
        setError(err.message);
        setCountry(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCountry();
  }, [countryId]);

  return { country, loading, error };
};
