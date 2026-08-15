import { useState, useMemo } from 'react';
import {
  RefreshCw,
  Users,
  Radio,
  AlertTriangle,
  WifiOff,
  Battery,
  Gauge,
  Navigation,
} from 'lucide-react';

import { useBranches } from '../context/BranchContext';
import { useCardMembers } from '../hooks/useCardMembers';
import { useLiveLocations } from '../hooks/useLiveLocations';
import LiveLocationMap from '../components/LiveLocationMap';

const StatTile = ({ icon, label, value, tone }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
    <div className={`p-2 rounded-lg ${tone}`}>{icon}</div>
    <div>
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { branches, loading: branchesLoading } = useBranches();
  const [branchId, setBranchId] = useState('');
  const [memberId, setMemberId] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { cardMembers, loading: membersLoading } = useCardMembers(branchId || null);

  // Picking a different branch invalidates whatever employee was selected in the old one.
  const handleBranchChange = (e) => {
    setBranchId(e.target.value);
    setMemberId('');
  };

  const { locations, loading, error, lastUpdated, refresh } = useLiveLocations({
    branchId: branchId || null,
    memberId: memberId || null,
    enabled: autoRefresh && Boolean(branchId || memberId),
  });

  const stats = useMemo(() => {
    const tracked = locations.length;
    const online = locations.filter((loc) => loc.has_fix && !loc.is_stale).length;
    const sos = locations.filter((loc) => loc.sos_button_pressed).length;
    const noFix = locations.filter((loc) => !loc.has_fix).length;
    return { tracked, online, sos, noFix };
  }, [locations]);

  const hasSelection = Boolean(branchId || memberId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Live Location Dashboard</h1>
        <p className="text-slate-500 text-sm">
          Select a branch to see every tracked employee, or narrow to a single employee.
        </p>
      </div>

      {/* Selection form */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Branch</label>
          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={branchId}
            onChange={handleBranchChange}
            disabled={branchesLoading}
          >
            <option value="">Select a branch…</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Employee</label>
          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm min-w-[200px] focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            disabled={!branchId || membersLoading}
          >
            <option value="">All employees</option>
            {cardMembers
              .filter((m) => m.card_id)
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
          </select>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={!hasSelection}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>

        <label className="flex items-center gap-2 text-sm text-slate-600 select-none">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded border-slate-300"
          />
          Auto-refresh (10s)
        </label>

        {lastUpdated ? (
          <span className="text-xs text-slate-400 ml-auto">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          Failed to load live locations: {error}
        </div>
      ) : null}

      {hasSelection ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatTile
              icon={<Users size={18} className="text-indigo-600" />}
              label="Tracked"
              value={stats.tracked}
              tone="bg-indigo-50"
            />
            <StatTile
              icon={<Radio size={18} className="text-emerald-600" />}
              label="Online"
              value={stats.online}
              tone="bg-emerald-50"
            />
            <StatTile
              icon={<AlertTriangle size={18} className="text-red-600" />}
              label="SOS Alerts"
              value={stats.sos}
              tone="bg-red-50"
            />
            <StatTile
              icon={<WifiOff size={18} className="text-slate-500" />}
              label="No Fix Yet"
              value={stats.noFix}
              tone="bg-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm h-[480px] overflow-hidden">
              <LiveLocationMap locations={locations} selectedMemberId={memberId ? Number(memberId) : null} />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-[480px] overflow-y-auto divide-y divide-slate-100">
              {locations.length === 0 && !loading ? (
                <p className="p-4 text-sm text-slate-400">No tracked employees in this selection.</p>
              ) : (
                locations.map((loc) => (
                  <button
                    key={loc.member_id}
                    type="button"
                    onClick={() => setMemberId(String(loc.member_id))}
                    className="w-full text-left p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-slate-800">{loc.member_name}</p>
                      {loc.sos_button_pressed ? (
                        <span className="text-xs font-semibold text-red-600 flex items-center gap-1">
                          <AlertTriangle size={14} /> SOS
                        </span>
                      ) : null}
                    </div>
                    {loc.has_fix ? (
                      <div className="mt-1 text-xs text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1">
                          <Navigation size={12} /> {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Gauge size={12} /> {loc.speed ?? 0} km/h
                        </span>
                        <span className="flex items-center gap-1">
                          <Battery size={12} /> {loc.battery ?? '—'}%
                        </span>
                        {loc.is_stale ? (
                          <span className="text-amber-600 font-medium">Stale</span>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">No location fix yet</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm h-72 flex items-center justify-center text-slate-400 border-dashed border-2">
          Select a branch above to see live employee locations on the map.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
