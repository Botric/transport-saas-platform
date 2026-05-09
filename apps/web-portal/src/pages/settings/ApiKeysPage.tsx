import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Copy, X, Key, CheckCircle } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components/ui';
import { getApiKeys, createApiKey, revokeApiKey } from '../../api/client';
import type { ApiKey } from '../../types';

const SCOPES = ['live:read', 'history:read', 'finance:read', 'tracking:read'];

export default function ApiKeysPage() {
  const qc = useQueryClient();
  const { data: keys = [], isLoading } = useQuery<ApiKey[]>({
    queryKey: ['api-keys'],
    queryFn: getApiKeys,
  });

  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: '', scopes: ['live:read'], expiresAt: '' });

  const create = useMutation({
    mutationFn: (data: object) => createApiKey(data),
    onSuccess: (key: ApiKey) => {
      qc.invalidateQueries({ queryKey: ['api-keys'] });
      setNewKey(key);
      setShowForm(false);
      setForm({ name: '', scopes: ['live:read'], expiresAt: '' });
    },
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['api-keys'] }),
  });

  function toggleScope(scope: string) {
    setForm((f) => ({
      ...f,
      scopes: f.scopes.includes(scope)
        ? f.scopes.filter((s) => s !== scope)
        : [...f.scopes, scope],
    }));
  }

  function copyKey() {
    if (!newKey?.plainKey) return;
    navigator.clipboard.writeText(newKey.plainKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-6">
      <PageHeader
        title="API Keys"
        description="Manage partner and integration API keys"
        action={
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Plus size={15} /> New API Key
          </button>
        }
      />

      {/* One-time reveal banner */}
      {newKey?.plainKey && (
        <div className="mb-5 bg-yellow-50 border border-yellow-300 rounded-xl p-4">
          <p className="font-semibold text-yellow-800 mb-1 flex items-center gap-2">
            <Key size={16} /> Copy your API key — it won't be shown again
          </p>
          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 font-mono text-sm bg-white border border-yellow-200 rounded px-3 py-2 select-all break-all">
              {newKey.plainKey}
            </code>
            <button
              onClick={copyKey}
              className="flex items-center gap-1.5 px-3 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 shrink-0"
            >
              {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="mt-2 text-xs text-yellow-700 hover:underline"
          >
            I've saved it — dismiss
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">New API Key</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate({ name: form.name, scopes: form.scopes, expiresAt: form.expiresAt || undefined });
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Partner integration"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Scopes</label>
              <div className="flex flex-wrap gap-2">
                {SCOPES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleScope(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      form.scopes.includes(s)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires (optional)</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={create.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {create.isPending ? 'Creating…' : 'Create Key'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading && <p className="text-gray-500">Loading…</p>}

      <div className="space-y-3">
        {keys.map((k) => (
          <div key={k.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                <Key size={16} className="text-gray-500" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{k.name}</span>
                  <StatusBadge status={k.status} />
                </div>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{k.keyPrefix}…</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {k.scopes.split(',').map((s) => (
                    <span key={s} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                {k.expiresAt && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    Expires {new Date(k.expiresAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {k.status === 'active' && (
              <button
                onClick={() => {
                  if (confirm('Revoke this API key? This cannot be undone.')) {
                    revoke.mutate(k.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <X size={13} /> Revoke
              </button>
            )}
          </div>
        ))}
        {!isLoading && keys.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Key size={32} className="mx-auto mb-2 opacity-30" />
            <p>No API keys yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
