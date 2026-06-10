import React, { useState } from 'react';
import { useCountries } from '../hooks/useCountries';

/**
 * Example component demonstrating how to use the countries API in a dropdown
 */
export const CountrySelect = ({ value, onChange, label = 'Country', required = false }) => {
  const { countries, loading, error } = useCountries();

  if (error) {
    return <div className="error">Error loading countries: {error}</div>;
  }

  return (
    <div className="form-group">
      <label htmlFor="country-select">
        {label}
        {required && <span className="required">*</span>}
      </label>
      <select
        id="country-select"
        value={value || ''}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        disabled={loading}
        required={required}
      >
        <option value="">
          {loading ? 'Loading countries...' : 'Select a country'}
        </option>
        {countries.map((country) => (
          <option key={country.id} value={country.id}>
            {country.name} ({country.country_code})
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySelect;
