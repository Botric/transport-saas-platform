import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { getRegions, createRegion, updateRegion } from '../../api/client';
import type { Region } from '../../types';
import { PageHeader, DataTable, StatusBadge } from '../../components/ui';

export default function RegionsPage() {
  const qc = useQueryClient();
  const { data: regions = [], isLoading } = useQuery<Region[]>({ queryKey: ['regions'], queryFn: getRegions });
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Region | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createMutation = useMutation({
    mutationFn: () => createRegion({ name, description }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['regions'] }); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => updateRegion(editing!.id, { name, description }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['regions'] }); resetForm(); },
  });

  const resetForm = () => { setShowForm(false); setEditing(null); setName(''); setDescription(''); };

  const openEdit = (r: Region) => { setEditing(r); setName(r.name); setDescription(r.description ?? ''); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    editing ? updateMutation.mutate() : createMutation.mutate();
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Regions"
        description="Geographic groupings for routes and drivers"
        action={
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} /> Add Region
          </button>
        }
      />

      {showForm && (
        <div className="m-6 bg-white border rounded-xl p-5 shadow-sm max-w-lg">
          <h3 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit Region' : 'New Region'}</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input required value={name} onChange={(e) => setName(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                {editing ? 'Save' : 'Create'}
              </button>
              <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded-lg transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-white m-6 rounded-xl border shadow-sm">
        <DataTable<Region>
          isLoading={isLoading}
          data={regions}
          columns={[
            { header: 'Name', cell: (r) => <span className="font-medium">{r.name}</span> },
            { header: 'Description', cell: (r) => r.description ?? '—' },
            { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
            {
              header: 'Actions', cell: (r) => (
                <button onClick={() => openEdit(r)} className="text-blue-600 hover:underline text-xs">Edit</button>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
