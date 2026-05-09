import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { getRoutes, getRegions, createRoute, updateRoute } from '../../api/client';
import { Route, Region } from '../../types';
import { PageHeader, DataTable, StatusBadge } from '../../components/ui';

export default function RoutesPage() {
  const qc = useQueryClient();
  const { data: routes = [], isLoading } = useQuery<Route[]>({ queryKey: ['routes'], queryFn: getRoutes });
  const { data: regions = [] } = useQuery<Region[]>({ queryKey: ['regions'], queryFn: getRegions });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Route | null>(null);
  const [form, setForm] = useState({ regionId: '', routeCode: '', routeName: '', description: '', ticketRequired: false });

  const resetForm = () => { setShowForm(false); setEditing(null); setForm({ regionId: '', routeCode: '', routeName: '', description: '', ticketRequired: false }); };

  const createMutation = useMutation({
    mutationFn: () => createRoute(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['routes'] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateRoute(editing!.id, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['routes'] }); resetForm(); },
  });

  const openEdit = (r: Route) => {
    setEditing(r);
    setForm({ regionId: r.regionId, routeCode: r.routeCode, routeName: r.routeName, description: r.description ?? '', ticketRequired: r.ticketRequired });
    setShowForm(true);
  };

  const regionName = (id: string) => regions.find((r) => r.id === id)?.name ?? id;

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Routes"
        description="Manage service routes"
        action={
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> Add Route
          </button>
        }
      />

      {showForm && (
        <div className="m-6 bg-white border rounded-xl p-5 shadow-sm max-w-lg">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit Route' : 'New Route'}</h3>
          <form onSubmit={(e) => { e.preventDefault(); editing ? updateMutation.mutate() : createMutation.mutate(); }} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
              <select required value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Select region —</option>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route Code *</label>
                <input required value={form.routeCode} onChange={(e) => setForm({ ...form, routeCode: e.target.value })}
                  placeholder="MCR-001" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Route Name *</label>
                <input required value={form.routeName} onChange={(e) => setForm({ ...form, routeName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={form.ticketRequired} onChange={(e) => setForm({ ...form, ticketRequired: e.target.checked })} />
              Ticket required
            </label>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {editing ? 'Save' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded-lg transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-white m-6 rounded-xl border shadow-sm">
        <DataTable<Route>
          isLoading={isLoading}
          data={routes}
          columns={[
            { header: 'Code', cell: (r) => <span className="font-mono font-medium">{r.routeCode}</span> },
            { header: 'Name', cell: (r) => r.routeName },
            { header: 'Region', cell: (r) => regionName(r.regionId) },
            { header: 'Ticket', cell: (r) => r.ticketRequired ? <span className="text-xs text-amber-600">Required</span> : <span className="text-xs text-gray-400">No</span> },
            { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            { header: 'Actions', cell: (r) => <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline text-xs">Edit</button> },
          ]}
        />
      </div>
    </div>
  );
}
