import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { getLive } from '../api/client';
import type { Prefs, LiveData } from '../types';

// Blue bus marker using a simple SVG data URL
const busIcon = new Icon({
  iconUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 50" width="40" height="50">
      <circle cx="20" cy="20" r="18" fill="#2563eb" stroke="white" stroke-width="2"/>
      <text x="20" y="26" text-anchor="middle" fill="white" font-size="18" font-weight="bold" font-family="sans-serif">🚌</text>
      <polygon points="20,44 13,32 27,32" fill="#2563eb"/>
    </svg>
  `),
  iconSize: [40, 50],
  iconAnchor: [20, 50],
  popupAnchor: [0, -52],
});

function RecenterMap({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  map.setView([lat, lon], map.getZoom());
  return null;
}

export default function LiveMapPage() {
  const navigate = useNavigate();
  const prefs: Prefs | null = (() => {
    try { return JSON.parse(localStorage.getItem('passenger_prefs') ?? ''); }
    catch { return null; }
  })();

  const { data: live, isLoading, refetch } = useQuery<LiveData>({
    queryKey: ['live', prefs?.routeId],
    queryFn: () => getLive(prefs!.routeId),
    enabled: !!prefs,
    refetchInterval: 15_000,
  });

  const session = live?.session;
  const hasLocation = session?.lastLat && session?.lastLon;
  const defaultCenter: [number, number] = [51.5074, -0.1278]; // London fallback
  const busPos: [number, number] | null = hasLocation
    ? [Number(session!.lastLat), Number(session!.lastLon)]
    : null;

  return (
    <div className="h-dvh flex flex-col relative">
      {/* Floating top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex items-center gap-3 px-4 pt-4 pb-3 bg-gradient-to-b from-black/30 to-transparent pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center"
        >
          <ArrowLeft size={18} className="text-gray-700" />
        </button>
        <div className="flex-1 bg-white rounded-xl px-3 py-2 shadow-md pointer-events-auto">
          <p className="text-xs text-gray-500">{prefs?.regionName}</p>
          <p className="text-sm font-semibold text-gray-800 leading-tight">{prefs?.routeName}</p>
        </div>
        <button
          onClick={() => void refetch()}
          disabled={isLoading}
          className="pointer-events-auto w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center"
        >
          <RefreshCw size={16} className={`text-gray-700 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Map */}
      <MapContainer
        center={busPos ?? defaultCenter}
        zoom={14}
        className="flex-1"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {busPos && (
          <>
            <Marker position={busPos} icon={busIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{session?.vehicleRegistration}</p>
                  {session?.lastCapacityLevel && (
                    <p className="text-gray-500 capitalize mt-0.5">{session.lastCapacityLevel.replace('-', ' ')}</p>
                  )}
                </div>
              </Popup>
            </Marker>
            <RecenterMap lat={busPos[0]} lon={busPos[1]} />
          </>
        )}
      </MapContainer>

      {/* Bottom info card */}
      {session && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] px-4 pb-6 pointer-events-none">
          <div className="bg-white rounded-2xl shadow-xl p-4 pointer-events-auto">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800">{session.vehicleRegistration}</p>
                {session.lastCapacityLevel && (
                  <p className="text-sm text-gray-500 capitalize">{session.lastCapacityLevel.replace('-', ' ')}</p>
                )}
              </div>
              {live?.nextDeparture && (
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">Departs</p>
                  <p className="font-semibold text-gray-800">{live.nextDeparture.departureTime}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {!busPos && !isLoading && (
        <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
          <div className="bg-white rounded-2xl shadow-xl px-6 py-4 text-center pointer-events-auto">
            <p className="font-semibold text-gray-700">No live location yet</p>
            <p className="text-sm text-gray-400 mt-1">The bus hasn't shared its location</p>
          </div>
        </div>
      )}
    </div>
  );
}
