import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../services/apiClient';

/**
 * Polling hook for live GPS locations, scoped to a branch or a single card member.
 *
 * @param {Object} params
 * @param {number|string|null} params.branchId - Show every tracked employee in this branch
 * @param {number|string|null} params.memberId - Show only this employee (takes priority over branchId)
 * @param {boolean} params.enabled - Whether polling should be active
 * @param {number} params.intervalMs - Poll interval in milliseconds (default: 10000)
 * @returns {Object} - { locations, loading, error, lastUpdated, refresh }
 */
export const useLiveLocations = ({ branchId, memberId, enabled = true, intervalMs = 10000 } = {}) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Guards against overlapping requests (a slow response landing after a newer one).
  const requestIdRef = useRef(0);
  const inFlightRef = useRef(false);

  const fetchLocations = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (memberId) {
        params.set('member_id', memberId);
      } else if (branchId) {
        params.set('branch_id', branchId);
      }
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await apiClient.get(`/locations/live${query}`);

      // A newer request already landed - discard this stale response.
      if (requestId !== requestIdRef.current) return;

      // Keep previously known markers visible on the map instead of flickering to empty.
      setLocations(data.data || []);
      setError(null);
      setLastUpdated(new Date());
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      console.error('Error fetching live locations:', err);
      setError(err.message);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
      inFlightRef.current = false;
    }
  }, [branchId, memberId]);

  useEffect(() => {
    if (!enabled || (!branchId && !memberId)) return;

    fetchLocations();
    const id = setInterval(fetchLocations, intervalMs);
    return () => clearInterval(id);
  }, [enabled, branchId, memberId, intervalMs, fetchLocations]);

  return { locations, loading, error, lastUpdated, refresh: fetchLocations };
};
