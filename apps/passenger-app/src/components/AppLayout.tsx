import { NavLink, Outlet } from 'react-router-dom';
import { Home, Map, Settings } from 'lucide-react';

export default function AppLayout() {
  return (
    <div className="flex flex-col h-dvh bg-gray-50">
      {/* Page content scrolls above the fixed bottom nav */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>

      {/* Bottom navigation */}
      <nav className="bg-white border-t border-gray-200 flex safe-pb">
        {[
          { to: '/', icon: Home, label: 'Home' },
          { to: '/map', icon: Map, label: 'Map' },
          { to: '/settings', icon: Settings, label: 'Settings' },
        ].map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-3 gap-0.5 text-xs font-medium transition-colors ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <Icon size={22} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
