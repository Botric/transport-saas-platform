import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Copy, Check } from 'lucide-react';
import api from '../../api/client';
import { ActivationCode, Region } from '../../types';
import { getRegions } from '../../api/client';
import { PageHeader, DataTable, StatusBadge } from '../../components/ui';

const getActivationCodes = () => api.get('/driver-app/activation-codes').then((r) => r.data);
const createCode = (data: object) => api.post('/driver-app/activation-codes', data).then((r) => r.data);
const disableCode = (id: string) => api.patch(`/driver-app/activation-codes/${id}`, { status: 'disabled' }).then((r) => r.data);

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} className="ml-2 text-gray-400 hover:text-gray-600">
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  );
}

export default function ActivationCodesPage() {
  const qc = useQueryClient();
  const { data: codes = [], isLoading } = useQuery<ActivationCode[]>({ queryKey: ['activation-codes'], queryFn: getActivationCodes });
  const { data: regions = [] } = useQuery<Region[]>({ queryKey: ['regions'], queryFn: getRegions });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', regionId: '', maxUses: '', expiresAt: '' });

  const createMutation = useMutation({
    mutationFn: () => createCode({
      code: form.code.toUpperCase(),
      regionId: form.regionId || undefined,
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      expiresAt: form.expiresAt || undefined,
    }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['activation-codes'] }); setShowForm(false); setForm({ code: '', regionId: '', maxUses: '', expiresAt: '' }); },
  });

  const disableMutation = useMutation({
    mutationFn: disableCode,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activation-codes'] }),
  });

  const regionName = (id?: string) => id ? (regions.find((r) => r.id === id)?.name ?? id) : '—';

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="Activation Codes"
        description="Codes used to activate the Driver App"
        action={
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus size={15} /> New Code
          </button>
        }
      />

      {showForm && (
        <div className="m-6 bg-white border rounded-xl p-5 shadow-sm max-w-lg">
          <h3 className="font-semibold text-gray-800 mb-4">New Activation Code</h3>
          <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="e.g. DRIVER123" className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region (optional)</label>
              <select value={form.regionId} onChange={(e) => setForm({ ...form, regionId: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— No restriction —</option>
                {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Uses</label>
                <input type="number" min="1" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                  placeholder="Unlimited" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
                <input type="datetime-local" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 hover:bg-gray-200 text-sm px-4 py-2 rounded-lg transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 overflow-auto bg-white m-6 rounded-xl border shadow-sm">
        <DataTable<ActivationCode>
          isLoading={isLoading}
          data={codes}
          columns={[
            { header: 'Code', cell: (c) => <span className="flex items-center font-mono font-medium">{c.code}<CopyButton text={c.code} /></span> },
            { header: 'Region', cell: (c) => regionName(c.regionId) },
            { header: 'Uses', cell: (c) => `${c.usedCount} / ${c.maxUses ?? '∞'}` },
            { header: 'Expires', cell: (c) => c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : '—' },
            { header: 'Status', cell: (c) => <StatusBadge status={c.status} /> },
            { header: 'Actions', cell: (c) => c.status === 'active' ? (
              <button onClick={() => { if (confirm('Disable this code?')) disableMutation.mutate(c.id); }}
                className="text-red-500 hover:underline text-xs">Disable</button>
            ) : '—' },
          ]}
        />
      </div>
    </div>
  );
}
