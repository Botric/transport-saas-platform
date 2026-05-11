import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getActiveSessions, endSession } from '../api/client';
import type { DriverSession } from '../types';
import { RefreshCw, BusFront, Clock, Wifi, WifiOff } from 'lucide-react';

// Fix default leaflet marker icons (Vite asset issue)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CAPACITY_COLOURS: Record<string, string> = {
  empty: 'bg-gray-100 text-gray-600',
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  full: 'bg-red-100 text-red-700',
  unknown: 'bg-gray-100 text-gray-500',
};

function minutesAgo(iso?: string) {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'Just now';
  return `${diff}m ago`;
}

export default function LiveTrackingPage() {
  const { data: sessions = [], isLoading, refetch, isFetching } = useQuery<DriverSession[]>({
    queryKey: ['active-sessions'],
    queryFn: getActiveSessions,
    refetchInterval: 15000,
  });

  const activeSessions = sessions.filter((s) => s.status === 'active');
  const mappable = activeSessions.filter((s) => s.lastLat && s.lastLon);

  const handleEnd = async (id: string) => {
    if (!confirm('End this driver session?')) return;
    await endSession(id);
    refetch();
  };

  const defaultCenter: [number, number] = mappable.length > 0
    ? [Number(mappable[0].lastLat), Number(mappable[0].lastLon)]
    : [53.48, -2.24];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b bg-white flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Live Tracking</h2>
          <p className="text-xs text-gray-500">
            {activeSessions.length} active session{activeSessions.length !== 1 ? 's' : ''} · auto-refreshes every 15s
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 p-4">
          <MapContainer center={defaultCenter} zoom={11} style={{ height: '100%', borderRadius: '0.5rem' }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mappable.map((s) => (
              <Marker key={s.id} position={[Number(s.lastLat), Number(s.lastLon)]}>
                <Popup>
                  <div className="text-sm space-y-1 min-w-[160px]">
                    <p className="font-semibold">{s.vehicleRegistration}</p>
                    <p className="text-gray-600">{s.driverName}</p>
                    {s.route && <p className="text-gray-500">{s.route.routeCode} — {s.route.routeName}</p>}
                    <p className="text-gray-400 text-xs">Updated {minutesAgo(s.lastTrackingAt)}</p>
                    {s.lastCapacityLevel && (
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${CAPACITY_COLOURS[s.lastCapacityLevel] ?? ''}`}>
                        {s.lastCapacityLevel}
                      </span>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Session list */}
        <aside className="w-80 bg-white border-l overflow-y-auto flex flex-col">
          <div className="px-4 py-3 border-b">
            <h3 className="text-sm font-semibold text-gray-700">Active Drivers</h3>
          </div>
          {isLoading && <p className="text-sm text-gray-400 p-4">Loading…</p>}
          {!isLoading && activeSessions.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 text-gray-400 gap-2 p-8">
              <WifiOff size={32} />
              <p className="text-sm">No active sessions</p>
            </div>
          )}
          {activeSessions.map((s) => (
            <div key={s.id} className="p-4 border-b hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <BusFront size={14} className="text-blue-500 shrink-0" />
                    <span className="font-semibold text-sm text-gray-800 truncate">{s.vehicleRegistration}</span>
                    {s.lastCapacityLevel && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CAPACITY_COLOURS[s.lastCapacityLevel] ?? ''}`}>
                        {s.lastCapacityLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5 truncate">{s.driverName}</p>
                  {s.route && (
                    <p className="text-xs text-gray-500 truncate">{s.route.routeCode} — {s.route.routeName}</p>
                  )}
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                    <Clock size={11} />
                    {minutesAgo(s.lastTrackingAt)}
                    {s.lastLat ? (
                      <span className="ml-1 text-green-500 flex items-center gap-0.5"><Wifi size={11} /> GPS</span>
                    ) : (
                      <span className="ml-1 text-gray-400 flex items-center gap-0.5"><WifiOff size={11} /> No GPS</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleEnd(s.id)}
                  className="text-xs text-red-500 hover:text-red-700 shrink-0 mt-0.5"
                >
                  End
                </button>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}
