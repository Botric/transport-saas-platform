import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, ChevronRight, LogOut } from 'lucide-react';
import type { Prefs } from '../types';

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const prefs: Prefs | null = (() => {
    try { return JSON.parse(localStorage.getItem('passenger_prefs') ?? ''); }
    catch { return null; }
  })();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="px-4 pt-8 pb-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Settings</h1>

      {/* Current service */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium px-4 pt-4 pb-2">Your service</p>
        {prefs ? (
          <div className="px-4 pb-4 space-y-1">
            <p className="text-gray-600 text-sm">{prefs.regionName}</p>
            <p className="text-gray-800 font-semibold">{prefs.routeName} <span className="text-gray-400 font-normal">({prefs.routeCode})</span></p>
          </div>
        ) : (
          <p className="px-4 pb-4 text-sm text-gray-400">Not set up yet</p>
        )}
        <button
          onClick={() => navigate('/setup')}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-t border-gray-100 text-blue-600 text-sm font-medium active:bg-gray-50"
        >
          <MapPin size={16} />
          Change region or route
          <ChevronRight size={16} className="ml-auto text-gray-400" />
        </button>
      </div>

      {/* Log out */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-4 text-red-500 text-sm font-medium active:bg-gray-50"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>

      <p className="text-center text-xs text-gray-300 pt-2">Tango Passenger App</p>
    </div>
  );
}
