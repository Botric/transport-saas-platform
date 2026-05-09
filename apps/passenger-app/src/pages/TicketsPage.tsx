import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ticket, CheckCircle, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import QRCode from 'qrcode';
import { getMyTickets, getPublicTicketProducts, claimTicket } from '../api/client';
import type { MyTicket, TicketProduct } from '../types';

function validityLabel(type: string) {
  const map: Record<string, string> = {
    single: 'Single journey',
    day: 'Day pass',
    week: 'Weekly pass',
    month: 'Monthly pass',
    custom: 'Custom',
  };
  return map[type] ?? type;
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    active:    'bg-green-100 text-green-700',
    expired:   'bg-gray-100 text-gray-500',
    used:      'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}

function TicketQR({ code }: { code: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, code, {
        margin: 1,
        width: 192,
        color: { dark: '#111827', light: '#ffffff' },
      });
    }
  }, [code]);
  return <canvas ref={canvasRef} className="rounded-lg" />;
}

function TicketCard({ ticket }: { ticket: MyTicket }) {
  const [open, setOpen] = useState(false);
  const isActive = ticket.status === 'active';

  return (
    <div className={`rounded-2xl border ${isActive ? 'border-blue-200 bg-blue-50' : 'border-gray-200 bg-white'} overflow-hidden`}>
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`}>
            <Ticket size={18} className={isActive ? 'text-white' : 'text-gray-500'} />
          </div>
          <div>
            <p className="font-semibold text-sm text-gray-900">
              {ticket.ticketProduct?.name ?? 'Ticket'}
            </p>
            <p className="text-xs text-gray-500">
              {ticket.ticketProduct ? validityLabel(ticket.ticketProduct.validityType) : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusChip status={ticket.status} />
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {/* Expanded — QR-style code */}
      {open && (
        <div className="px-4 pb-4 border-t border-dashed border-blue-200">
          <div className="mt-3 bg-white rounded-xl p-4 flex flex-col items-center gap-2 border border-gray-200">
            <TicketQR code={ticket.ticketCode} />
            <p className="font-mono text-2xl font-bold tracking-[0.25em] text-gray-900 select-all">
              {ticket.ticketCode}
            </p>
            <p className="text-xs text-gray-400">Show this code to your driver</p>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
            {ticket.validFrom && (
              <div>
                <p className="font-medium text-gray-600">Valid from</p>
                <p>{new Date(ticket.validFrom).toLocaleDateString()}</p>
              </div>
            )}
            {ticket.validUntil && (
              <div>
                <p className="font-medium text-gray-600">Valid until</p>
                <p>{new Date(ticket.validUntil).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-600">Payment</p>
              <p className="capitalize">{ticket.paymentStatus.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="font-medium text-gray-600">Claimed</p>
              <p>{new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onClaim }: { product: TicketProduct; onClaim: (id: string) => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between gap-3">
      <div>
        <p className="font-semibold text-sm text-gray-900">{product.name}</p>
        {product.description && <p className="text-xs text-gray-500 mt-0.5">{product.description}</p>}
        <p className="text-xs text-blue-600 font-medium mt-1">
          {product.isFree ? 'Free' : `£${(product.price / 100).toFixed(2)}`} · {validityLabel(product.validityType)}
        </p>
      </div>
      <button
        onClick={() => onClaim(product.id)}
        className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-semibold px-3 py-2 rounded-xl hover:bg-blue-700 active:scale-95 transition-all whitespace-nowrap"
      >
        <Plus size={14} />
        {product.isFree ? 'Claim' : 'Buy'}
      </button>
    </div>
  );
}

export default function TicketsPage() {
  const qc = useQueryClient();
  const [showProducts, setShowProducts] = useState(false);
  const [claimedId, setClaimedId] = useState<string | null>(null);

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery<MyTicket[]>({
    queryKey: ['my-tickets'],
    queryFn: getMyTickets,
  });

  const { data: products = [] } = useQuery<TicketProduct[]>({
    queryKey: ['public-products'],
    queryFn: getPublicTicketProducts,
    enabled: showProducts,
  });

  const claim = useMutation({
    mutationFn: (id: string) => claimTicket(id),
    onSuccess: (ticket) => {
      setClaimedId(ticket.id);
      setShowProducts(false);
      qc.invalidateQueries({ queryKey: ['my-tickets'] });
    },
  });

  const active = tickets.filter((t) => t.status === 'active');
  const past = tickets.filter((t) => t.status !== 'active');

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 pt-12 pb-4">
        <h1 className="text-xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-sm text-gray-500 mt-0.5">{active.length} active</p>
      </div>

      <div className="flex-1 px-4 py-4 space-y-4">

        {/* Success banner */}
        {claimedId && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-3 flex items-center gap-2">
            <CheckCircle size={18} className="text-green-600 shrink-0" />
            <p className="text-sm text-green-700 font-medium">Ticket claimed! Tap it below to view your code.</p>
          </div>
        )}

        {/* Get a ticket button */}
        <button
          onClick={() => setShowProducts((v) => !v)}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold py-3 rounded-2xl hover:bg-blue-700 active:scale-95 transition-all"
        >
          <Plus size={18} />
          Get a ticket
        </button>

        {/* Available products */}
        {showProducts && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Available tickets</p>
            {products.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No tickets available for your route.</p>
            )}
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onClaim={(id) => claim.mutate(id)}
              />
            ))}
            {claim.isError && (
              <p className="text-sm text-red-600 text-center">Failed to claim ticket. Please try again.</p>
            )}
          </div>
        )}

        {/* Active tickets */}
        {ticketsLoading && <p className="text-center text-gray-400 py-8">Loading…</p>}

        {active.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Active</p>
            {active.map((t) => <TicketCard key={t.id} ticket={t} />)}
          </div>
        )}

        {/* Past tickets */}
        {past.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Past tickets</p>
            {past.map((t) => <TicketCard key={t.id} ticket={t} />)}
          </div>
        )}

        {!ticketsLoading && tickets.length === 0 && !showProducts && (
          <div className="text-center py-12 text-gray-400">
            <Ticket size={40} className="mx-auto mb-3 opacity-25" />
            <p className="font-medium">No tickets yet</p>
            <p className="text-sm mt-1">Tap "Get a ticket" to see what's available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
