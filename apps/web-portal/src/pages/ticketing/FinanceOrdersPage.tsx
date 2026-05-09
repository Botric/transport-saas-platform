import { useQuery } from '@tanstack/react-query';
import { ReceiptText } from 'lucide-react';
import { PageHeader, StatusBadge } from '../../components/ui';
import { getTicketOrders } from '../../api/client';
import type { TicketOrder } from '../../types';

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    not_required: 'bg-gray-100 text-gray-600',
    pending:      'bg-yellow-100 text-yellow-700',
    paid:         'bg-green-100 text-green-700',
    cancelled:    'bg-red-100 text-red-700',
    refunded:     'bg-purple-100 text-purple-700',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status.replace('_', ' ')}
    </span>
  );
}

export default function FinanceOrdersPage() {
  const { data: orders = [], isLoading } = useQuery<TicketOrder[]>({
    queryKey: ['ticket-orders'],
    queryFn: getTicketOrders,
  });

  const total = orders.reduce((sum, o) => sum + o.amountPaid, 0);

  return (
    <div className="p-6">
      <PageHeader
        title="Finance — Orders"
        subtitle={`${orders.length} orders · £${(total / 100).toFixed(2)} total`}
      />

      {isLoading && <p className="text-gray-500">Loading…</p>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Ticket code</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Passenger</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Payment</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Valid until</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono font-semibold text-blue-700">{o.ticketCode}</td>
                <td className="px-4 py-3 text-gray-800">{o.ticketProduct?.name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{o.user?.name ?? '—'}</td>
                <td className="px-4 py-3"><PaymentBadge status={o.paymentStatus} /></td>
                <td className="px-4 py-3 text-right font-medium">
                  {o.amountPaid === 0 ? 'Free' : `£${(o.amountPaid / 100).toFixed(2)}`}
                </td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-gray-500">
                  {o.validUntil ? new Date(o.validUntil).toLocaleDateString() : '—'}
                </td>
                <td className="px-4 py-3 text-gray-400">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isLoading && orders.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <ReceiptText size={32} className="mx-auto mb-2 opacity-30" />
            <p>No orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
