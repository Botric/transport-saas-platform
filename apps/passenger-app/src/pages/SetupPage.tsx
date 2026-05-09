import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import { getRegions, getRoutes } from '../api/client';
import type { Region, Route, Prefs } from '../types';

type Step = 'region' | 'route';

export default function SetupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('region');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const { data: regions = [], isLoading: loadingRegions } = useQuery<Region[]>({
    queryKey: ['p-regions'],
    queryFn: getRegions,
  });

  const { data: routes = [], isLoading: loadingRoutes } = useQuery<Route[]>({
    queryKey: ['p-routes', selectedRegion?.id],
    queryFn: () => getRoutes(selectedRegion!.id),
    enabled: !!selectedRegion,
  });

  const chooseRegion = (region: Region) => {
    setSelectedRegion(region);
    setStep('route');
  };

  const chooseRoute = (route: Route) => {
    const prefs: Prefs = {
      regionId: selectedRegion!.id,
      regionName: selectedRegion!.name,
      routeId: route.id,
      routeName: route.routeName,
      routeCode: route.routeCode,
    };
    localStorage.setItem('passenger_prefs', JSON.stringify(prefs));
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 px-5 pt-12 pb-6">
        <h1 className="text-white text-2xl font-bold">Set up your service</h1>
        <p className="text-blue-200 text-sm mt-1">
          {step === 'region' ? 'Choose your region' : 'Choose your route'}
        </p>
        {/* Progress */}
        <div className="flex gap-2 mt-4">
          <div className="h-1 flex-1 rounded bg-white" />
          <div className={`h-1 flex-1 rounded ${step === 'route' ? 'bg-white' : 'bg-white/30'}`} />
        </div>
      </div>

      <div className="flex-1 px-4 py-5">
        {step === 'region' && (
          <>
            {loadingRegions ? (
              <p className="text-center text-gray-400 py-12">Loading regions…</p>
            ) : regions.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No regions available yet.</p>
            ) : (
              <ul className="space-y-2">
                {regions.map((region) => (
                  <li key={region.id}>
                    <button
                      onClick={() => chooseRegion(region)}
                      className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition-transform"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{region.name}</p>
                        {region.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{region.description}</p>
                        )}
                      </div>
                      <ChevronRight size={18} className="text-gray-400 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {step === 'route' && (
          <>
            <button
              onClick={() => setStep('region')}
              className="text-blue-600 text-sm font-medium mb-4 flex items-center gap-1"
            >
              ← Change region
            </button>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3 px-1">
              Routes in {selectedRegion?.name}
            </p>
            {loadingRoutes ? (
              <p className="text-center text-gray-400 py-12">Loading routes…</p>
            ) : routes.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No routes in this region yet.</p>
            ) : (
              <ul className="space-y-2">
                {routes.map((route) => (
                  <li key={route.id}>
                    <button
                      onClick={() => chooseRoute(route)}
                      className="w-full flex items-center justify-between bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left active:scale-[0.98] transition-transform"
                    >
                      <div>
                        <p className="font-semibold text-gray-800">{route.routeName}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{route.routeCode}</p>
                      </div>
                      <CheckCircle2 size={18} className="text-gray-300 shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
