import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Edit, ToggleLeft, ToggleRight, Ticket, Download, Smartphone } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components/ui';
import { getTicketProducts, createTicketProduct, updateTicketProduct, getRoutes } from '../../api/client';
import type { TicketProduct, Route } from '../../types';

const EMPTY_FORM = {
  name: '',
  description: '',
  price: 0,
  isFree: true,
  validityType: 'single',
  maxUses: '',
  visible: true,
  routeIds: [] as string[],
};

export default function TicketProductsPage() {
  const qc = useQueryClient();
  const { data: products = [], isLoading } = useQuery<TicketProduct[]>({
    queryKey: ['ticket-products'],
    queryFn: getTicketProducts,
  });
  const { data: routes = [] } = useQuery<Route[]>({
    queryKey: ['routes'],
    queryFn: getRoutes,
  });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TicketProduct | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const save = useMutation({
    mutationFn: (data: object) =>
      editing
        ? updateTicketProduct(editing.id, data)
        : createTicketProduct(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ticket-products'] });
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
    },
  });

  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateTicketProduct(id, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ticket-products'] }),
  });

  function openNew() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(p: TicketProduct) {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? '',
      price: p.price,
      isFree: p.isFree,
      validityType: p.validityType,
      maxUses: p.maxUses != null ? String(p.maxUses) : '',
      visible: p.visible,
      routeIds: p.routes.map((r) => r.id),
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    save.mutate({
      name: form.name,
      description: form.description || undefined,
      price: form.isFree ? 0 : Number(form.price),
      isFree: form.isFree,
      validityType: form.validityType,
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      visible: form.visible,
      routeIds: form.routeIds,
    });
  }

  function toggleRoute(id: string) {
    setForm((f) => ({
      ...f,
      routeIds: f.routeIds.includes(id)
        ? f.routeIds.filter((r) => r !== id)
        : [...f.routeIds, id],
    }));
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Ticket Products"
        description="Define free and paid tickets linked to routes"
        action={
          <button onClick={openNew}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            New Product
          </button>
        }
      />

      {/* Passenger APK download banner */}
      <div className="mx-6 mt-2 mb-4 flex items-center gap-4 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
        <Smartphone size={28} className="text-emerald-600 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-900">Passenger App (Android)</p>
          <p className="text-xs text-emerald-700">Share this APK with passengers so they can buy tickets below.</p>
        </div>
        <a
          href="/apks/tango-passenger.apk"
          download="tango-passenger.apk"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shrink-0"
        >
          <Download size={14} /> Download APK
        </a>
      </div>

      {isLoading && <p className="text-gray-500">Loading…</p>}

      {showForm && (
        <div className="mb-6 bg-white rounded-xl shadow p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editing ? 'Edit Product' : 'New Ticket Product'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Validity</label>
                <select
                  value={form.validityType}
                  onChange={(e) => setForm((f) => ({ ...f, validityType: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="single">Single journey</option>
                  <option value="day">Day pass</option>
                  <option value="week">Weekly pass</option>
                  <option value="month">Monthly pass</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked }))}
                  className="rounded"
                />
                Free ticket
              </label>

              {!form.isFree && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (pence)</label>
                  <input
                    type="number"
                    min={1}
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                    className="w-32 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max uses (optional)</label>
                <input
                  type="number"
                  min={1}
                  value={form.maxUses}
                  onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                  className="w-32 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm((f) => ({ ...f, visible: e.target.checked }))}
                  className="rounded"
                />
                Visible in passenger app
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Valid routes</label>
              <div className="flex flex-wrap gap-2">
                {routes.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => toggleRoute(r.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      form.routeIds.includes(r.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    {r.routeCode} — {r.routeName}
                  </button>
                ))}
                {routes.length === 0 && (
                  <p className="text-sm text-gray-400">No routes found. Create routes first.</p>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={save.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {save.isPending ? 'Saving…' : 'Save'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null); setForm(EMPTY_FORM); }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {products.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                <Ticket size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">{p.name}</span>
                  <StatusBadge status={p.status} />
                  {p.isFree
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Free</span>
                    : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">£{(p.price / 100).toFixed(2)}</span>
                  }
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.validityType}</span>
                </div>
                {p.description && <p className="text-sm text-gray-500 mt-0.5">{p.description}</p>}
                {p.routes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.routes.map((r) => (
                      <span key={r.id} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {r.routeCode}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openEdit(p)}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                title="Edit"
              >
                <Edit size={15} />
              </button>
              <button
                onClick={() => toggle.mutate({ id: p.id, status: p.status === 'active' ? 'inactive' : 'active' })}
                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                title={p.status === 'active' ? 'Deactivate' : 'Activate'}
              >
                {p.status === 'active' ? <ToggleRight size={15} className="text-green-500" /> : <ToggleLeft size={15} />}
              </button>
            </div>
          </div>
        ))}
        {!isLoading && products.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Ticket size={32} className="mx-auto mb-2 opacity-30" />
            <p>No ticket products yet. Create one to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
