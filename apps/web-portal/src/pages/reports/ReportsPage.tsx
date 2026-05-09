import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download, Activity, History, FileText, Shield, Globe } from 'lucide-react';
import { PageHeader } from '../../components/ui';
import {
  getReportLiveRoutes,
  getHistoricalSessions,
  getAuditLogs,
  downloadCsv,
} from '../../api/client';
import type { AuditLogEntry } from '../../types';

interface LiveRoute {
  sessionId: string;
  routeName: string;
  driverName: string;
  vehicleReg: string;
  passengerCount: number;
}

interface HistoricalSession {
  id: string;
  routeName: string;
  driverName: string;
  startedAt: string;
  endedAt: string;
}

export default function ReportsPage() {
  const [finFrom, setFinFrom] = useState('');
  const [finTo, setFinTo] = useState('');
  const [trkFrom, setTrkFrom] = useState('');
  const [trkTo, setTrkTo] = useState('');
  const [histFrom, setHistFrom] = useState('');
  const [histTo, setHistTo] = useState('');

  const { data: liveRoutes = [] } = useQuery<LiveRoute[]>({
    queryKey: ['report-live-routes'],
    queryFn: getReportLiveRoutes,
    refetchInterval: 30_000,
  });

  const { data: historicalSessions = [], isLoading: loadingHist } = useQuery<HistoricalSession[]>({
    queryKey: ['report-history', histFrom, histTo],
    queryFn: () => getHistoricalSessions(histFrom || undefined, histTo || undefined),
  });

  const { data: auditLogs = [], isLoading: loadingAudit } = useQuery<AuditLogEntry[]>({
    queryKey: ['audit-logs'],
    queryFn: () => getAuditLogs(200),
  });

  function dlFinance() {
    const params = new URLSearchParams();
    if (finFrom) params.set('from', finFrom);
    if (finTo) params.set('to', finTo);
    downloadCsv(`/api/reports/export/finance?${params}`, 'finance-export.csv');
  }

  function dlTracking() {
    const params = new URLSearchParams();
    if (trkFrom) params.set('from', trkFrom);
    if (trkTo) params.set('to', trkTo);
    downloadCsv(`/api/reports/export/tracking?${params}`, 'tracking-export.csv');
  }

  return (
    <div className="p-6 space-y-8">
      <PageHeader title="Reports & Exports" description="Operational data, CSV exports and audit trail" />

      {/* Live overview */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Activity size={15} /> Live Routes
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {liveRoutes.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">No active routes right now.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Route', 'Driver', 'Vehicle', 'Passengers'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {liveRoutes.map((r) => (
                  <tr key={r.sessionId} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{r.routeName}</td>
                    <td className="px-4 py-2 text-gray-600">{r.driverName}</td>
                    <td className="px-4 py-2 text-gray-600">{r.vehicleReg}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {r.passengerCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Finance export */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <FileText size={15} /> Finance Export (CSV)
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" value={finFrom} onChange={(e) => setFinFrom(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" value={finTo} onChange={(e) => setFinTo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button
            onClick={dlFinance}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
          >
            <Download size={15} /> Download Finance CSV
          </button>
        </div>
      </section>

      {/* Tracking export */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <BarChart3 size={15} /> Tracking Export (CSV)
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" value={trkFrom} onChange={(e) => setTrkFrom(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" value={trkTo} onChange={(e) => setTrkTo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <button
            onClick={dlTracking}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            <Download size={15} /> Download Tracking CSV
          </button>
        </div>
      </section>

      {/* GTFS export */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Globe size={15} /> GTFS Export
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-700 font-medium">GTFS Feed (ZIP)</p>
            <p className="text-xs text-gray-400 mt-0.5">
              agency, routes, stops, trips, stop_times and calendar files ready for journey planners.
            </p>
          </div>
          <button
            onClick={() => downloadCsv('/api/reports/export/gtfs', 'gtfs.zip')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
          >
            <Download size={15} /> Download GTFS ZIP
          </button>
        </div>
      </section>

      {/* Historical sessions */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <History size={15} /> Historical Sessions
        </h2>
        <div className="flex flex-wrap gap-4 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">From</label>
            <input type="date" value={histFrom} onChange={(e) => setHistFrom(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">To</label>
            <input type="date" value={histTo} onChange={(e) => setHistTo(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingHist ? (
            <p className="text-gray-400 text-sm p-4">Loading…</p>
          ) : historicalSessions.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">No sessions found for this period.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {['Route', 'Driver', 'Started', 'Ended'].map((h) => (
                    <th key={h} className="px-4 py-2 text-left font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {historicalSessions.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{s.routeName}</td>
                    <td className="px-4 py-2 text-gray-600">{s.driverName}</td>
                    <td className="px-4 py-2 text-gray-600">{new Date(s.startedAt).toLocaleString()}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {s.endedAt ? new Date(s.endedAt).toLocaleString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Audit log */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Shield size={15} /> Audit Log (last 200 writes)
        </h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loadingAudit ? (
            <p className="text-gray-400 text-sm p-4">Loading…</p>
          ) : auditLogs.length === 0 ? (
            <p className="text-gray-400 text-sm p-4">No audit events yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {['Actor', 'Action', 'Status', 'IP', 'Time'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left font-medium text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-mono text-gray-600 max-w-[120px] truncate">{log.actor}</td>
                      <td className="px-3 py-2 text-gray-800">{log.action}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          log.statusCode < 300 ? 'bg-green-50 text-green-700' :
                          log.statusCode < 400 ? 'bg-yellow-50 text-yellow-700' :
                          'bg-red-50 text-red-700'
                        }`}>{log.statusCode}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-400 font-mono">{log.ipAddress ?? '—'}</td>
                      <td className="px-3 py-2 text-gray-400">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
