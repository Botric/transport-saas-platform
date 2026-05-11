import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { getRoutes, getDepartures, createDeparture } from '../../api/client';
import type { Route, Departure } from '../../types';
import { PageHeader, DataTable, StatusBadge } from '../../components/ui';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const defaultDays = { mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false };

export default function DeparturesPage() {
  const qc = useQueryClient();
  const { data: routes = [] } = useQuery<Route[]>({ queryKey: ['routes'], queryFn: getRoutes });
  const [selectedRoute, setSelectedRoute] = useState('');
  const { data: departures = [], isLoading } = useQuery<Departure[]>({
    queryKey: ['departures', selectedRoute],
    queryFn: () => getDepartures(selectedRoute),
    enabled: !!selectedRoute,
  });
  const [showForm, setShowForm] = useState(false);
  const [time, setTime] = useState('08:00');
  const [days, setDays] = useState({ ...defaultDays });

  const toggleDay = (d: typeof DAYS[number]) => setDays((prev) => ({ ...prev, [d]: !prev[d] }));

  const createMutation = useMutation({
    mutationFn: () => createDeparture({ routeId: selectedRoute, departureTime: time, operatingDays: days }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departures', selectedRoute] }); setShowForm(false); setTime('08:00'); setDays({ ...defaultDays }); },
  });

  const formatDays = (d: Departure['operatingDays']) =>
    DAYS.filter((k) => d[k]).map((k) => k.charAt(0).toUpperCase() + k.slice(1)).join(', ') || 'None';

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Departures"
        description="Scheduled departure times per route"
        action={
          selectedRoute ? (
            <button onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Plus size={15} /> Add Departure
            </button>
          ) : undefined
        }
      />

      <div className="px-6 pt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Select Route</label>
        <select value={selectedRoute} onChange={(e) => setSelectedRoute(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-72">
          <option value="">— Choose a route —</option>
          {routes.map((r) => <option key={r.id} value={r.id}>{r.routeCode} — {r.routeName}</option>)}
        </select>
      </div>

      {showForm && (
        <div className="mx-6 mt-4 bg-white border rounded-xl p-5 shadow-sm max-w-md">
          <h3 className="font-semibold text-gray-800 mb-4">New Departure</h3>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Time *</label>
              <input type="time" required value={time} onChange={(e) => setTime(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Operating Days</label>
              <div className="flex gap-2 flex-wrap">
                {DAYS.map((d) => (
                  <button type="button" key={d} onClick={() => toggleDay(d)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${days[d] ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'}`}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded-lg transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-white m-6 rounded-xl border shadow-sm">
        {!selectedRoute ? (
          <p className="text-sm text-gray-400 text-center py-12">Select a route to view departures</p>
        ) : (
          <DataTable<Departure>
            isLoading={isLoading}
            data={departures}
            emptyMessage="No departures for this route"
            columns={[
              { header: 'Time', cell: (d) => <span className="font-mono font-medium">{d.departureTime.slice(0, 5)}</span> },
              { header: 'Operating Days', cell: (d) => <span className="text-sm">{formatDays(d.operatingDays)}</span> },
              { header: 'Valid From', cell: (d) => d.validFrom ?? '—' },
              { header: 'Valid To', cell: (d) => d.validTo ?? '—' },
              { header: 'Status', cell: (d) => <StatusBadge status={d.status} /> },
            ]}
          />
        )}
      </div>
    </div>
  );
}
