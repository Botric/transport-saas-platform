import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import api from '../../api/client';
import type { VehicleRegistration, Region } from '../../types';
import { getRegions } from '../../api/client';
import { PageHeader, DataTable, StatusBadge } from '../../components/ui';

const getVehicles = () => api.get('/driver-app/vehicle-registrations').then((r) => r.data);
const createVehicle = (data: object) => api.post('/driver-app/vehicle-registrations', data).then((r) => r.data);
const updateVehicle = (id: string, data: object) => api.patch(`/driver-app/vehicle-registrations/${id}`, data).then((r) => r.data);

export default function VehiclesPage() {
  const qc = useQueryClient();
  const { data: vehicles = [], isLoading } = useQuery<VehicleRegistration[]>({ queryKey: ['vehicles'], queryFn: getVehicles });
  const { data: regions = [] } = useQuery<Region[]>({ queryKey: ['regions'], queryFn: getRegions });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<VehicleRegistration | null>(null);
  const [form, setForm] = useState({ registration: '', vehicleName: '', capacity: '', regionId: '' });

  const resetForm = () => { setShowForm(false); setEditing(null); setForm({ registration: '', vehicleName: '', capacity: '', regionId: '' }); };

  const createMutation = useMutation({
    mutationFn: () => createVehicle({ ...form, capacity: form.capacity ? Number(form.capacity) : undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateVehicle(editing!.id, { ...form, capacity: form.capacity ? Number(form.capacity) : undefined }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['vehicles'] }); resetForm(); },
  });

  const disableMutation = useMutation({
    mutationFn: (id: string) => updateVehicle(id, { status: 'inactive' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles'] }),
  });

  const openEdit = (v: VehicleRegistration) => {
    setEditing(v);
    setForm({ registration: v.registration, vehicleName: v.vehicleName ?? '', capacity: v.capacity?.toString() ?? '', regionId: v.regionId ?? '' });
    setShowForm(true);
  };

  const regionName = (id?: string) => id ? (regions.find((r) => r.id === id)?.name ?? id) : '—';

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Vehicle Registrations"
        description="Prefilled vehicle list for the Driver App"
        action={
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> Add Vehicle
          </button>
        }
      />

      {showForm && (
        <div className="m-6 bg-white border rounded-xl p-5 shadow-sm max-w-lg">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
          <form onSubmit={(e) => { e.preventDefault(); editing ? updateMutation.mutate() : createMutation.mutate(); }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Registration *</label>
                <input required value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value.toUpperCase() })}
                  placeholder="AB12 CDE" className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Name</label>
                <input value={form.vehicleName} onChange={(e) => setForm({ ...form, vehicleName: e.target.value })}
                  placeholder="e.g. Coach 3" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input type="number" min="1" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">— Any —</option>
                  {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">{editing ? 'Save' : 'Add'}</button>
              <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded-lg transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-white m-6 rounded-xl border shadow-sm">
        <DataTable<VehicleRegistration>
          isLoading={isLoading}
          data={vehicles}
          columns={[
            { header: 'Registration', cell: (v) => <span className="font-mono font-medium">{v.registration}</span> },
            { header: 'Name', cell: (v) => v.vehicleName ?? '—' },
            { header: 'Capacity', cell: (v) => v.capacity ?? '—' },
            { header: 'Region', cell: (v) => regionName(v.regionId) },
            { header: 'Status', cell: (v) => <StatusBadge status={v.status} /> },
            { header: 'Actions', cell: (v) => (
              <div className="flex gap-3">
                <button onClick={() => openEdit(v)} className="text-blue-600 hover:underline text-xs">Edit</button>
                {v.status === 'active' && (
                  <button onClick={() => { if (confirm('Mark as inactive?')) disableMutation.mutate(v.id); }} className="text-red-500 hover:underline text-xs">Disable</button>
                )}
              </div>
            )},
          ]}
        />
      </div>
    </div>
  );
}
