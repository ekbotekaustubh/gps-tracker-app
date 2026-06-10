# Countries API Documentation

## Overview
The Countries API provides endpoints to retrieve country information for use in dropdown forms and other UI components.

## API Endpoints

### Get All Countries
Returns a list of all countries in the system.

**Endpoint:** `GET /api/v1/countries`

**Response:** 
```json
{
  "status": "success",
  "message": "Countries retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "India",
      "country_code": "IN",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    },
    {
      "id": 2,
      "name": "United States",
      "country_code": "US",
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ]
}
```

### Get Country by ID
Returns a specific country by its ID.

**Endpoint:** `GET /api/v1/countries/<country_id>`

**Parameters:**
- `country_id` (integer, required): The ID of the country

**Response:**
```json
{
  "status": "success",
  "message": "Country retrieved successfully.",
  "data": {
    "id": 1,
    "name": "India",
    "country_code": "IN",
    "created_at": "2024-01-01T00:00:00",
    "updated_at": "2024-01-01T00:00:00"
  }
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "Country not found."
}
```

### Get States by Country ID
Returns a list of all states belonging to a specific country.

**Endpoint:** `GET /api/v1/states/<country_id>`

**Parameters:**
- `country_id` (integer, required): The ID of the country

**Response:**
```json
{
  "status": "success",
  "message": "States retrieved successfully.",
  "data": [
    {
      "id": 1,
      "name": "Maharashtra",
      "state_code": "MH",
      "country_id": 1,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "Country not found."
}
```

### Get Cities by State ID
Returns a list of all cities belonging to a specific state.

**Endpoint:** `GET /api/v1/cities/<state_id>`

**Parameters:**
- `state_id` (integer, required): The ID of the state

**Response:**
```json
{
  "status": "success",
  "message": "Cities retrieved successfully.",
  "data": [
    {
      "id": 287,
      "name": "Mumbai",
      "state_id": 14,
      "country_id": 1,
      "created_at": "2024-01-01T00:00:00",
      "updated_at": "2024-01-01T00:00:00"
    }
  ]
}
```

**Error Response (404):**
```json
{
  "status": "fail",
  "message": "State not found."
}
```

## Frontend Integration

### Using the Custom Hook

#### `useCountries()`
Fetches all countries on component mount.

```jsx
import { useCountries } from '../hooks/useCountries';

function MyForm() {
  const { countries, loading, error } = useCountries();

  if (loading) return <p>Loading countries...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <select>
      <option value="">Select a country</option>
      {countries.map(country => (
        <option key={country.id} value={country.id}>
          {country.name}
        </option>
      ))}
    </select>
  );
}
```

#### `useCountryById(countryId)`
Fetches a specific country by ID.

```jsx
import { useCountryById } from '../hooks/useCountries';

function CountryDetail({ countryId }) {
  const { country, loading, error } = useCountryById(countryId);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return <div>{country?.name}</div>;
}
```

### Using the CountrySelect Component

```jsx
import React, { useState } from 'react';
import CountrySelect from '../components/CountrySelect';

function MyForm() {
  const [selectedCountry, setSelectedCountry] = useState(null);

  return (
    <form>
      <CountrySelect
        value={selectedCountry}
        onChange={setSelectedCountry}
        label="Country"
        required={true}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Direct Fetch Example

```jsx
const response = await fetch('http://localhost:5000/api/v1/countries');
const data = await response.json();
console.log(data.data); // Array of countries
```

## Environment Configuration

To use a different API URL, set the `VITE_API_URL` environment variable in your `.env` file:

```
VITE_API_URL=https://api.example.com
```

If not set, it defaults to `http://localhost:5000`.

## HTTP Status Codes

- `200 OK`: Successfully retrieved data
- `404 Not Found`: Country not found (for specific country endpoint)
- `500 Internal Server Error`: Server error occurred

## Error Handling

All endpoints return consistent error responses:

```json
{
  "status": "fail",
  "message": "Error description"
}
```

## CORS

The API is configured with CORS headers allowing requests from all origins with the following methods:
- GET
- POST
- PUT
- DELETE
- OPTIONS

## Swagger Documentation

Interactive API documentation is available at `/docs` endpoint when the server is running.

Example: `http://localhost:5000/docs`
