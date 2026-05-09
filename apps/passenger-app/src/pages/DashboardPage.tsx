import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Clock, RefreshCw, AlertCircle, Navigation } from 'lucide-react';
import { getLive, getDepartures } from '../api/client';
import type { Prefs, LiveData, Departure } from '../types';

const CAPACITY_LABELS: Record<string, { label: string; colour: string }> = {
  empty:    { label: 'Seats available',  colour: 'bg-green-100 text-green-700' },
  quiet:    { label: 'Quiet',            colour: 'bg-green-100 text-green-700' },
  busy:     { label: 'Getting busy',     colour: 'bg-amber-100 text-amber-700' },
  'very-busy': { label: 'Very busy',     colour: 'bg-orange-100 text-orange-700' },
  full:     { label: 'Full',             colour: 'bg-red-100 text-red-600' },
};

function getCapacity(level: string | null) {
  if (!level) return null;
  return CAPACITY_LABELS[level] ?? { label: level, colour: 'bg-gray-100 text-gray-600' };
}

function formatDelay(mins: number | null) {
  if (mins === null) return null;
  if (Math.abs(mins) < 2) return <span className="text-green-600 font-medium">On time</span>;
  if (mins > 0) return <span className="text-amber-600 font-medium">{mins} min late</span>;
  return <span className="text-green-600 font-medium">{Math.abs(mins)} min early</span>;
}

function timeAgo(iso: string | null) {
  if (!iso) return null;
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  return `${Math.round(diff / 60)}m ago`;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const prefs: Prefs | null = (() => {
    try { return JSON.parse(localStorage.getItem('passenger_prefs') ?? ''); }
    catch { return null; }
  })();

  if (!prefs) {
    navigate('/setup', { replace: true });
    return null;
  }

  const { data: live, isLoading: loadingLive, dataUpdatedAt, refetch } = useQuery<LiveData>({
    queryKey: ['live', prefs.routeId],
    queryFn: () => getLive(prefs.routeId),
    refetchInterval: 30_000,
  });

  const { data: departures = [] } = useQuery<Departure[]>({
    queryKey: ['p-departures', prefs.routeId],
    queryFn: () => getDepartures(prefs.routeId),
  });

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const upcoming = departures
    .filter((d) => d.departureTime.slice(0, 5) >= currentTime)
    .slice(0, 4);

  const capacity = getCapacity(live?.session?.lastCapacityLevel ?? null);
  const hasLocation = live?.session?.lastLat && live?.session?.lastLon;

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Route header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{prefs.regionName}</p>
          <h1 className="text-xl font-bold text-gray-900 mt-0.5">{prefs.routeName}</h1>
          <p className="text-sm text-gray-500">{prefs.routeCode}</p>
        </div>
        <button
          onClick={() => void refetch()}
          disabled={loadingLive}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw size={18} className={loadingLive ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Live status card */}
      <div className={`rounded-2xl p-5 shadow-sm ${live?.session ? 'bg-blue-600' : 'bg-white border border-gray-100'}`}>
        {loadingLive && !live ? (
          <p className="text-gray-400 text-sm">Loading live data…</p>
        ) : live?.session ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white text-sm font-medium">Live now</span>
              <span className="text-blue-300 text-xs ml-auto">{timeAgo(live.session.lastTrackingAt)}</span>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <p className="text-white/80 text-xs mb-0.5">Vehicle</p>
                <p className="text-white font-mono font-semibold text-lg">{live.session.vehicleRegistration}</p>
              </div>
              {live.nextDeparture && (
                <div className="text-right">
                  <p className="text-white/80 text-xs mb-0.5">Departure</p>
                  <p className="text-white font-semibold text-lg">{live.nextDeparture.departureTime}</p>
                  <p className="text-blue-200 text-xs">{formatDelay(live.nextDeparture.delayMinutes)}</p>
                </div>
              )}
            </div>

            {capacity && (
              <div className="mt-4 flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${capacity.colour}`}>
                  {capacity.label}
                </span>
                {hasLocation && (
                  <button
                    onClick={() => navigate('/map')}
                    className="flex items-center gap-1.5 text-white/80 text-xs font-medium bg-white/20 px-3 py-1.5 rounded-full active:bg-white/30"
                  >
                    <Navigation size={12} /> View on map
                  </button>
                )}
              </div>
            )}
            {!capacity && hasLocation && (
              <div className="mt-4">
                <button
                  onClick={() => navigate('/map')}
                  className="flex items-center gap-1.5 text-white/80 text-xs font-medium bg-white/20 px-3 py-1.5 rounded-full active:bg-white/30"
                >
                  <Navigation size={12} /> View on map
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-gray-400 shrink-0" />
            <div>
              <p className="text-gray-700 font-medium text-sm">No active service</p>
              {live?.nextDeparture && (
                <p className="text-gray-500 text-xs mt-0.5">
                  Next scheduled: <span className="font-medium">{live.nextDeparture.departureTime}</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Today's timetable */}
      {upcoming.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Today's timetable</h2>
          </div>
          <ul className="divide-y divide-gray-50">
            {upcoming.map((d) => (
              <li key={d.id} className="flex items-center py-2.5 first:pt-0 last:pb-0">
                <span className="font-mono text-gray-800 font-medium w-14">{d.departureTime.slice(0, 5)}</span>
                <span className="text-xs text-gray-400">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
                    .filter((_, i) => Object.values(d.operatingDays)[i])
                    .join(', ')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Map teaser */}
      {hasLocation && (
        <button
          onClick={() => navigate('/map')}
          className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:bg-gray-50"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <MapPin size={20} className="text-blue-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">Live map</p>
            <p className="text-xs text-gray-500">See where your bus is right now</p>
          </div>
          <span className="ml-auto text-gray-300">›</span>
        </button>
      )}

      {dataUpdatedAt > 0 && (
        <p className="text-center text-xs text-gray-300">
          Updated {new Date(dataUpdatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}
