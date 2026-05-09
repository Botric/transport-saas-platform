import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  MapPin, Route, Clock, QrCode, Car, LayoutDashboard, LogOut,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
  { to: '/', label: 'Live Tracking', icon: LayoutDashboard, end: true },
  { to: '/regions', label: 'Regions', icon: MapPin },
  { to: '/routes', label: 'Routes', icon: Route },
  { to: '/departures', label: 'Departures', icon: Clock },
  { to: '/activation-codes', label: 'Activation Codes', icon: QrCode },
  { to: '/vehicles', label: 'Vehicles', icon: Car },
];

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
        <div className="px-5 py-5 border-b border-gray-700">
          <h1 className="text-lg font-bold tracking-tight">Transport Portal</h1>
          <p className="text-xs text-gray-400 mt-0.5">Admin Dashboard</p>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
